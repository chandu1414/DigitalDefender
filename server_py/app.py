import os
import re
import secrets
from datetime import datetime, timezone
from flask import Flask, request, jsonify, g, send_file, send_from_directory, Response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

from db import (
    init_db,
    get_user_by_email,
    get_user_by_id,
    create_user,
    list_users,
    update_last_login,
    update_user_status,
    update_password,
    list_resources,
    get_resource_by_id,
    create_resource,
    delete_resource,
    record_download,
    get_user_download_ids,
    create_password_reset,
    get_valid_password_reset,
    mark_password_reset_used,
    get_platform_stats,
    save_pending_signup,
    get_pending_signup,
    increment_otp_attempts,
    delete_pending_signup
)
from auth_utils import encode_token, token_required, admin_required, optional_token
from seed import seed_database
from email_service import send_otp_email

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB max upload

# Enable CORS for frontend local development
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000", "http://127.0.0.1:5000"],
    "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads', 'resources')
os.makedirs(UPLOAD_DIR, exist_ok=True)

CLIENT_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'client', 'dist'))

def format_bytes(size_bytes):
    if not size_bytes:
        return '0 Bytes'
    for unit in ['Bytes', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"

# --- Health Check ---
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'DigitalDefender Flask API',
        'timestamp': datetime.now(timezone.utc).isoformat() + 'Z'
    })

# --- Authentication Routes ---

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name:
        return jsonify({'error': 'Please provide your full name.'}), 400
    if not email:
        return jsonify({'error': 'Please provide a valid email address.'}), 400
    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_regex, email):
        return jsonify({'error': 'Invalid email address format.'}), 400

    existing = get_user_by_email(email)
    if existing:
        return jsonify({'error': 'An account with this email already exists. Please log in instead.'}), 409

    # Generate cryptographically secure 6-digit OTP code (100000 - 999999)
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    password_hash = generate_password_hash(password)

    # Save to pending email verifications table with 10-minute expiry
    save_pending_signup(name=name, email=email, password_hash=password_hash, otp_code=otp_code, expires_in_minutes=10)

    # Dispatch verification email
    email_result = send_otp_email(to_email=email, to_name=name, otp_code=otp_code)

    response_data = {
        'message': f'Verification code sent to {email}. Please enter the 6-digit code to complete registration.',
        'requireOtp': True,
        'email': email
    }
    # In simulation mode, provide dev hint so developer/user is never locked out
    if email_result.get('mode') == 'simulated':
        response_data['simulatedNotice'] = f"Simulation mode: OTP code is {otp_code} (configure SMTP on Render for production)"
        response_data['devOtp'] = otp_code

    return jsonify(response_data), 200

@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    otp = data.get('otp', '').strip()

    if not email or not otp:
        return jsonify({'error': 'Please provide both email and 6-digit verification code.'}), 400

    pending = get_pending_signup(email)
    if not pending:
        existing = get_user_by_email(email)
        if existing:
            return jsonify({'error': 'This email is already verified. Please log in.'}), 400
        return jsonify({'error': 'No pending registration found for this email, or the code expired. Please sign up again.'}), 404

    # Brute-force lockout after 5 incorrect attempts
    if pending.get('attempts', 0) >= 5:
        delete_pending_signup(email)
        return jsonify({'error': 'Too many incorrect attempts. For security, please sign up again to receive a new code.'}), 429

    # Expiration check
    expires_str = pending['expires_at'].replace('Z', '')
    expires_dt = datetime.fromisoformat(expires_str)
    if datetime.now(timezone.utc) > expires_dt:
        delete_pending_signup(email)
        return jsonify({'error': 'Verification code has expired. Please request a new one.'}), 400

    # OTP validation
    if pending['otp_code'] != otp:
        increment_otp_attempts(email)
        remaining = 5 - (pending.get('attempts', 0) + 1)
        return jsonify({'error': f'Incorrect verification code. {remaining} attempt(s) remaining.'}), 400

    # Successful verification: transfer user into users table
    new_user = create_user(
        name=pending['name'],
        email=pending['email'],
        password_hash=pending['password_hash'],
        role='user'
    )
    delete_pending_signup(email)

    token = encode_token(new_user)
    return jsonify({
        'message': 'Email verified successfully! Welcome to DigitalDefender.',
        'user': new_user,
        'token': token
    }), 201

@app.route('/api/auth/resend-otp', methods=['POST'])
def resend_otp():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({'error': 'Please provide an email address.'}), 400

    pending = get_pending_signup(email)
    if not pending:
        return jsonify({'error': 'No pending registration found for this email. Please sign up again.'}), 404

    # Rate limiting: 30 seconds cooldown between resends
    last_sent_str = pending.get('last_sent_at', '').replace('Z', '')
    if last_sent_str:
        last_sent_dt = datetime.fromisoformat(last_sent_str)
        seconds_passed = (datetime.now(timezone.utc) - last_sent_dt).total_seconds()
        if seconds_passed < 30:
            remaining_cooldown = int(30 - seconds_passed)
            return jsonify({'error': f'Please wait {remaining_cooldown} seconds before requesting another code.'}), 429

    new_otp = f"{secrets.randbelow(900000) + 100000}"
    save_pending_signup(
        name=pending['name'],
        email=pending['email'],
        password_hash=pending['password_hash'],
        otp_code=new_otp,
        expires_in_minutes=10
    )

    email_result = send_otp_email(to_email=email, to_name=pending['name'], otp_code=new_otp)

    response_data = {
        'message': f'A fresh verification code has been dispatched to {email}.',
        'email': email
    }
    if email_result.get('mode') == 'simulated':
        response_data['simulatedNotice'] = f"Simulation mode: OTP code is {new_otp}"
        response_data['devOtp'] = new_otp

    return jsonify(response_data), 200

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Please provide both email and password.'}), 400

    user = get_user_by_email(email, include_password=True)
    if not user:
        return jsonify({'error': 'Invalid email or password.'}), 401

    if user.get('status') != 'active':
        return jsonify({'error': 'This account has been deactivated. Please contact support.'}), 403

    if not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    update_last_login(user['id'])

    safe_user = {k: v for k, v in user.items() if k != 'password_hash'}
    token = encode_token(safe_user)

    return jsonify({
        'message': 'Logged in successfully!',
        'user': safe_user,
        'token': token
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def me():
    return jsonify({'user': g.current_user})

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({'error': 'Please provide your account email.'}), 400

    user = get_user_by_email(email)
    if not user:
        return jsonify({
            'message': 'If an account exists with that email, a password reset link has been generated.',
            'resetLink': None
        })

    token = create_password_reset(user['id'])
    reset_url = f"/reset-password?token={token}"

    return jsonify({
        'message': 'Password reset link generated successfully.',
        'resetToken': token,
        'resetUrl': reset_url,
        'simulatedNotice': f"In a production environment, an email is dispatched to {user['email']}. For local testing, follow the generated link below."
    })

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token', '')
    new_password = data.get('newPassword', '')

    if not token:
        return jsonify({'error': 'Missing password reset token.'}), 400
    if not new_password or len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters long.'}), 400

    reset_record = get_valid_password_reset(token)
    if not reset_record:
        return jsonify({'error': 'Invalid or expired password reset link. Please request a new one.'}), 400

    password_hash = generate_password_hash(new_password)
    success = update_password(reset_record['user_id'], password_hash)
    if not success:
        return jsonify({'error': 'User not found.'}), 404

    mark_password_reset_used(token)
    return jsonify({'message': 'Your password has been successfully reset. You can now log in.'})

# --- Resources Routes ---

@app.route('/api/resources', methods=['GET'])
@optional_token
def get_resources():
    topic = request.args.get('topic', None)
    resources = list_resources(topic)

    user_download_ids = []
    if g.current_user:
        user_download_ids = get_user_download_ids(g.current_user['id'])

    formatted = []
    for r in resources:
        formatted.append({
            **r,
            'isDownloadedByUser': r['id'] in user_download_ids
        })

    return jsonify({'resources': formatted})

@app.route('/api/resources/<resource_id>', methods=['GET'])
@optional_token
def get_single_resource(resource_id):
    resource = get_resource_by_id(resource_id)
    if not resource:
        return jsonify({'error': 'Resource not found.'}), 404
    return jsonify({'resource': resource})

@app.route('/api/resources/<resource_id>/download', methods=['GET'])
@token_required
def download_resource(resource_id):
    resource = get_resource_by_id(resource_id)
    if not resource:
        return jsonify({'error': 'Resource not found.'}), 404

    raw_path = resource.get('file_path', '')
    file_path = None
    if raw_path and os.path.isabs(raw_path) and os.path.exists(raw_path):
        file_path = raw_path
    else:
        # Check relative to repo root
        candidate_rel = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', raw_path))
        if os.path.exists(candidate_rel):
            file_path = candidate_rel
        else:
            base_name = os.path.basename(raw_path.replace('\\', '/'))
            candidate_upload = os.path.join(UPLOAD_DIR, base_name)
            if os.path.exists(candidate_upload):
                file_path = candidate_upload

    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'PDF file is currently unavailable on server storage.'}), 404

    # Record download in database
    record_download(g.current_user['id'], resource['id'])
    print(f"Download recorded: User '{g.current_user['name']}' ({g.current_user['email']}) downloaded '{resource['title']}'.")

    return send_file(
        file_path,
        as_attachment=True,
        download_name=resource['file_name'],
        mimetype='application/pdf'
    )

# --- Admin Routes ---

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def admin_stats():
    stats = get_platform_stats()
    return jsonify({'stats': stats})

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def admin_users():
    search = request.args.get('search', '')
    users = list_users(search)
    return jsonify({'users': users})

@app.route('/api/admin/users/<user_id>/status', methods=['PATCH'])
@admin_required
def admin_user_status(user_id):
    data = request.get_json() or {}
    status = data.get('status')
    if status not in ['active', 'suspended']:
        return jsonify({'error': 'Status must be active or suspended.'}), 400

    updated = update_user_status(user_id, status)
    if not updated:
        return jsonify({'error': 'User not found.'}), 404

    return jsonify({'message': 'User status updated successfully.', 'user': updated})

@app.route('/api/admin/resources', methods=['POST'])
@admin_required
def admin_upload_resource():
    title = request.form.get('title', '').strip()
    topic = request.form.get('topic', '').strip()
    description = request.form.get('description', 'No description provided.').strip()
    author = request.form.get('author', 'DigitalDefender Security Team').strip()

    if 'pdf' not in request.files:
        return jsonify({'error': 'Please select a PDF file to upload.'}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({'error': 'No file selected.'}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF documents are allowed for upload.'}), 400

    if not title:
        return jsonify({'error': 'Please provide a title for the resource.'}), 400

    if not topic:
        return jsonify({'error': 'Please specify or select a topic tag.'}), 400

    safe_name = secure_filename(file.filename) or 'resource.pdf'
    timestamp = int(datetime.now(timezone.utc).timestamp())
    saved_filename = f"{timestamp}-{safe_name}"
    save_path = os.path.join(UPLOAD_DIR, saved_filename)
    file.save(save_path)

    file_size_formatted = format_bytes(os.path.getsize(save_path))

    new_resource = create_resource(
        title=title,
        description=description,
        topic=topic,
        file_name=file.filename,
        file_path=save_path,
        file_size=file_size_formatted,
        author=author
    )

    return jsonify({
        'message': 'Resource uploaded and published successfully!',
        'resource': new_resource
    }), 201

@app.route('/api/admin/resources/<resource_id>', methods=['DELETE'])
@admin_required
def admin_delete_resource(resource_id):
    resource = get_resource_by_id(resource_id)
    if not resource:
        return jsonify({'error': 'Resource not found.'}), 404

    try:
        raw_path = resource.get('file_path', '')
        file_to_del = None
        if raw_path and os.path.isabs(raw_path) and os.path.exists(raw_path):
            file_to_del = raw_path
        else:
            candidate_rel = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', raw_path))
            if os.path.exists(candidate_rel):
                file_to_del = candidate_rel
            else:
                base_name = os.path.basename(raw_path.replace('\\', '/'))
                candidate_upload = os.path.join(UPLOAD_DIR, base_name)
                if os.path.exists(candidate_upload):
                    file_to_del = candidate_upload

        if file_to_del and os.path.exists(file_to_del):
            os.remove(file_to_del)
    except Exception as e:
        print(f"Warning deleting physical file: {e}")

    delete_resource(resource_id)
    return jsonify({'message': 'Resource deleted successfully.'})

# --- Search Engine Discovery Routes ---

@app.route('/robots.txt', methods=['GET'])
def serve_robots():
    robots_path = os.path.join(CLIENT_DIST, 'robots.txt')
    if not os.path.exists(robots_path):
        robots_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'robots.txt'))
    if os.path.exists(robots_path):
        with open(robots_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return Response(content, mimetype='text/plain; charset=utf-8')
    return Response("User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://digitaldefender.onrender.com/sitemap.xml\n", mimetype='text/plain; charset=utf-8')

@app.route('/sitemap.xml', methods=['GET'])
@app.route('//sitemap.xml', methods=['GET'])
def serve_sitemap():
    sitemap_path = os.path.join(CLIENT_DIST, 'sitemap.xml')
    if not os.path.exists(sitemap_path):
        sitemap_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'sitemap.xml'))
    if os.path.exists(sitemap_path):
        with open(sitemap_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return Response(content, mimetype='application/xml; charset=utf-8')
    return Response("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"><url><loc>https://digitaldefender.onrender.com/</loc></url></urlset>", mimetype='application/xml; charset=utf-8')

# --- Static React Client Serving (Production mode on port 5000) ---

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_client(path):
    if path.startswith('api/'):
        return jsonify({'error': 'Endpoint not found'}), 404
    if os.path.exists(CLIENT_DIST):
        target_file = os.path.join(CLIENT_DIST, path)
        if path != '' and os.path.exists(target_file):
            return send_from_directory(CLIENT_DIST, path)
        return send_from_directory(CLIENT_DIST, 'index.html')
    return "Client dist not built yet. Run 'npm run build' or access Vite dev server on port 5173.", 404

# Seed database on startup (supports both direct execution and production WSGI servers like gunicorn)
try:
    seed_database()
except Exception as e:
    print(f"Database startup check: {e}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[DigitalDefender] Flask Server starting on: http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
