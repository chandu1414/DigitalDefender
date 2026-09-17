import os
import io
import urllib.request
from werkzeug.utils import secure_filename

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'uploads', 'resources'))
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Cloudinary configuration from environment variables
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '').strip()
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '').strip()
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '').strip()
CLOUDINARY_URL = os.environ.get('CLOUDINARY_URL', '').strip()

def is_cloudinary_configured():
    return bool(CLOUDINARY_URL or (CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET))

def _init_cloudinary():
    if not is_cloudinary_configured():
        return False
    try:
        import cloudinary
        if CLOUDINARY_URL:
            cloudinary.config(cloudinary_url=CLOUDINARY_URL)
        else:
            cloudinary.config(
                cloud_name=CLOUDINARY_CLOUD_NAME,
                api_key=CLOUDINARY_API_KEY,
                api_secret=CLOUDINARY_API_SECRET,
                secure=True
            )
        return True
    except Exception as e:
        print(f"[Storage] Failed to initialize Cloudinary: {e}")
        return False

def save_resource_file(file_storage, custom_filename=None):
    """
    Saves an uploaded file to Cloudinary if configured; otherwise saves locally.
    Returns:
        dict: {
            'file_path': str (cloud URL or relative path),
            'file_size_bytes': int,
            'storage': 'cloudinary' or 'local'
        }
    """
    safe_name = secure_filename(custom_filename or file_storage.filename or 'document.pdf')
    
    # 1. Try Cloudinary if configured
    if _init_cloudinary():
        try:
            import cloudinary.uploader
            # Read file bytes from file_storage
            file_storage.seek(0)
            upload_result = cloudinary.uploader.upload(
                file_storage,
                resource_type="raw",
                folder="digitaldefender/resources",
                use_filename=True,
                unique_filename=True
            )
            secure_url = upload_result.get('secure_url')
            file_size = upload_result.get('bytes', 0)
            print(f"[Storage] Successfully uploaded to Cloudinary: {secure_url}")
            return {
                'file_path': secure_url,
                'file_size_bytes': file_size,
                'storage': 'cloudinary'
            }
        except Exception as e:
            print(f"[Storage] Cloudinary upload error, falling back to local: {e}")

    # 2. Local filesystem fallback
    file_storage.seek(0)
    save_path = os.path.join(UPLOAD_DIR, safe_name)
    file_storage.save(save_path)
    file_size = os.path.getsize(save_path)
    rel_path = os.path.join('server_py', 'uploads', 'resources', safe_name).replace('\\', '/')
    print(f"[Storage] Saved file to local storage: {rel_path}")
    return {
        'file_path': rel_path,
        'file_size_bytes': file_size,
        'storage': 'local'
    }

def delete_resource_file(file_path):
    """
    Deletes a file from Cloudinary (if URL) or from local disk.
    """
    if not file_path:
        return

    # Check if Cloudinary URL
    if file_path.startswith('http://') or file_path.startswith('https://'):
        if _init_cloudinary():
            try:
                import cloudinary.uploader
                # Extract public_id from Cloudinary URL
                # Example URL: https://res.cloudinary.com/.../raw/upload/v1234/digitaldefender/resources/file.pdf
                parts = file_path.split('/upload/')
                if len(parts) > 1:
                    after_upload = parts[1]
                    # strip version prefix if present (e.g. v1789291980/)
                    sub_parts = after_upload.split('/', 1)
                    if len(sub_parts) > 1 and sub_parts[0].startswith('v') and sub_parts[0][1:].isdigit():
                        public_id = sub_parts[1]
                    else:
                        public_id = after_upload
                    
                    cloudinary.uploader.destroy(public_id, resource_type="raw")
                    print(f"[Storage] Purged Cloudinary asset: {public_id}")
            except Exception as e:
                print(f"[Storage] Error deleting from Cloudinary: {e}")
        return

    # Local file deletion
    try:
        candidate_rel = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', file_path))
        if os.path.exists(candidate_rel):
            os.remove(candidate_rel)
            print(f"[Storage] Removed local file: {candidate_rel}")
            return
        
        base_name = os.path.basename(file_path.replace('\\', '/'))
        candidate_upload = os.path.join(UPLOAD_DIR, base_name)
        if os.path.exists(candidate_upload):
            os.remove(candidate_upload)
            print(f"[Storage] Removed local file: {candidate_upload}")
    except Exception as e:
        print(f"[Storage] Error removing local file: {e}")

def resolve_resource_file(file_path):
    """
    Resolves the resource file for downloading.
    Returns:
        tuple: (type, target)
        where type is 'url' and target is string URL,
        OR type is 'local' and target is local absolute filepath,
        OR (None, None) if file cannot be found.
    """
    if not file_path:
        return None, None

    if file_path.startswith('http://') or file_path.startswith('https://'):
        return 'url', file_path

    # Check direct path
    if os.path.isabs(file_path) and os.path.exists(file_path):
        return 'local', file_path

    # Check relative to project root
    candidate_rel = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', file_path))
    if os.path.exists(candidate_rel):
        return 'local', candidate_rel

    # Check basename in UPLOAD_DIR
    base_name = os.path.basename(file_path.replace('\\', '/'))
    candidate_upload = os.path.join(UPLOAD_DIR, base_name)
    if os.path.exists(candidate_upload):
        return 'local', candidate_upload

    return None, None
