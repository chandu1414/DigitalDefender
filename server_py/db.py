import sqlite3
import os
import uuid
import secrets
from datetime import datetime, timedelta, timezone

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
DB_PATH = os.path.join(DATA_DIR, 'digitaldefender.db')

os.makedirs(DATA_DIR, exist_ok=True)

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        last_login_at TEXT NOT NULL,
        download_count INTEGER NOT NULL DEFAULT 0
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        topic TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size TEXT NOT NULL,
        author TEXT NOT NULL,
        download_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS downloads (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        downloaded_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(resource_id) REFERENCES resources(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS email_verifications (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        last_sent_at TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    ''')

    conn.commit()
    conn.close()

# --- User Queries ---

def get_user_by_email(email, include_password=False):
    if not email:
        return None
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    user = dict(row)
    if not include_password:
        user.pop('password_hash', None)
    return user

def get_user_by_id(user_id, include_password=False):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    user = dict(row)
    if not include_password:
        user.pop('password_hash', None)
    return user

def create_user(name, email, password_hash, role='user'):
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat() + 'Z'
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO users (id, name, email, password_hash, role, status, created_at, last_login_at, download_count)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?, 0)
    ''', (user_id, name.strip(), email.strip().lower(), password_hash, role, now, now))
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

def list_users(search=''):
    conn = get_connection()
    cursor = conn.cursor()
    if search and search.strip():
        q = f"%{search.strip().lower()}%"
        cursor.execute('''
        SELECT id, name, email, role, status, created_at, last_login_at, download_count
        FROM users
        WHERE LOWER(name) LIKE ? OR LOWER(email) LIKE ?
        ORDER BY created_at DESC
        ''', (q, q))
    else:
        cursor.execute('''
        SELECT id, name, email, role, status, created_at, last_login_at, download_count
        FROM users
        ORDER BY created_at DESC
        ''')
    rows = cursor.fetchall()
    conn.close()
    # Zero password exposure guaranteed
    return [dict(r) for r in rows]

def update_last_login(user_id):
    now = datetime.now(timezone.utc).isoformat() + 'Z'
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET last_login_at = ? WHERE id = ?', (now, user_id))
    conn.commit()
    conn.close()

def update_user_status(user_id, status):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET status = ? WHERE id = ?', (status, user_id))
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

def update_password(user_id, password_hash):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET password_hash = ? WHERE id = ?', (password_hash, user_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

# --- Resource Queries ---

def list_resources(topic=None):
    conn = get_connection()
    cursor = conn.cursor()
    if topic and topic.strip().lower() != 'all':
        cursor.execute('SELECT * FROM resources WHERE LOWER(topic) = LOWER(?) ORDER BY created_at DESC', (topic.strip(),))
    else:
        cursor.execute('SELECT * FROM resources ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_resource_by_id(resource_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM resources WHERE id = ?', (resource_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_resource(title, description, topic, file_name, file_path, file_size, author='DigitalDefender Security Team'):
    resource_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat() + 'Z'
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO resources (id, title, description, topic, file_name, file_path, file_size, author, download_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    ''', (resource_id, title.strip(), description.strip(), topic.strip(), file_name, file_path, file_size, author.strip(), now))
    conn.commit()
    conn.close()
    return get_resource_by_id(resource_id)

def delete_resource(resource_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM resources WHERE id = ?', (resource_id,))
    conn.commit()
    conn.close()

def record_download(user_id, resource_id):
    download_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat() + 'Z'
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('INSERT INTO downloads (id, user_id, resource_id, downloaded_at) VALUES (?, ?, ?, ?)',
                   (download_id, user_id, resource_id, now))
    cursor.execute('UPDATE users SET download_count = download_count + 1 WHERE id = ?', (user_id,))
    cursor.execute('UPDATE resources SET download_count = download_count + 1 WHERE id = ?', (resource_id,))

    conn.commit()
    conn.close()

def get_user_download_ids(user_id):
    if not user_id:
        return []
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT DISTINCT resource_id FROM downloads WHERE user_id = ?', (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [r['resource_id'] for r in rows]

# --- Password Resets ---

def create_password_reset(user_id):
    token = secrets.token_hex(32)
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat() + 'Z'
    now = datetime.now(timezone.utc).isoformat() + 'Z'
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO password_resets (id, user_id, token, expires_at, used, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
    ''', (str(uuid.uuid4()), user_id, token, expires_at, now))
    conn.commit()
    conn.close()
    return token

def get_valid_password_reset(token):
    if not token:
        return None
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM password_resets WHERE token = ? AND used = 0', (token,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    record = dict(row)
    expires = datetime.fromisoformat(record['expires_at'].replace('Z', ''))
    if datetime.now(timezone.utc) > expires:
        return None
    return record

def mark_password_reset_used(token):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE password_resets SET used = 1 WHERE token = ?', (token,))
    conn.commit()
    conn.close()

# --- Platform Stats ---

def get_platform_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) as cnt FROM users')
    total_users = cursor.fetchone()['cnt']
    cursor.execute("SELECT COUNT(*) as cnt FROM users WHERE status = 'active'")
    active_users = cursor.fetchone()['cnt']
    cursor.execute('SELECT COUNT(*) as cnt FROM downloads')
    total_downloads = cursor.fetchone()['cnt']
    cursor.execute('SELECT COUNT(*) as cnt FROM resources')
    total_resources = cursor.fetchone()['cnt']
    conn.close()
    return {
        'totalUsers': total_users,
        'activeUsers': active_users,
        'totalDownloads': total_downloads,
        'totalResources': total_resources
    }

# --- Email Verification (OTP) Queries ---

def save_pending_signup(name, email, password_hash, otp_code, expires_in_minutes=10):
    conn = get_connection()
    cursor = conn.cursor()
    now_dt = datetime.now(timezone.utc)
    now = now_dt.isoformat() + 'Z'
    expires_at = (now_dt + timedelta(minutes=expires_in_minutes)).isoformat() + 'Z'
    record_id = str(uuid.uuid4())

    cursor.execute('''
    INSERT INTO email_verifications (id, email, name, password_hash, otp_code, expires_at, attempts, last_sent_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        password_hash = excluded.password_hash,
        otp_code = excluded.otp_code,
        expires_at = excluded.expires_at,
        attempts = 0,
        last_sent_at = excluded.last_sent_at
    ''', (record_id, email.strip().lower(), name.strip(), password_hash, otp_code.strip(), expires_at, now, now))

    conn.commit()
    conn.close()
    return get_pending_signup(email)

def get_pending_signup(email):
    if not email:
        return None
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM email_verifications WHERE LOWER(email) = LOWER(?)', (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def increment_otp_attempts(email):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
    UPDATE email_verifications
    SET attempts = attempts + 1
    WHERE LOWER(email) = LOWER(?)
    ''', (email.strip(),))
    conn.commit()
    conn.close()

def delete_pending_signup(email):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM email_verifications WHERE LOWER(email) = LOWER(?)', (email.strip(),))
    conn.commit()
    conn.close()

