import os
import re
from datetime import datetime, timezone
from flask import Flask, request, jsonify, g, send_file, send_from_directory
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
    get_platform_stats
)
from auth_utils import encode_token, token_required, admin_required, optional_token
from seed import seed_database

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

    password_hash = generate_password_hash(password)
    new_user = create_user(name=name, email=email, password_hash=password_hash, role='user')
    token = encode_token(new_user)

    return jsonify({
        'message': 'Account created successfully!',
        'user': new_user,
        'token': token
    }), 201

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

    file_path = os.path.abspath(resource['file_path'])
    if not os.path.exists(file_path):
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
        if os.path.exists(resource['file_path']):
            os.remove(resource['file_path'])
    except Exception as e:
        print(f"Warning deleting physical file: {e}")

    delete_resource(resource_id)
    return jsonify({'message': 'Resource deleted successfully.'})

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
