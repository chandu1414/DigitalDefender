import os
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, g
from db import get_user_by_id

JWT_SECRET = os.environ.get('JWT_SECRET', 'digitaldefender_super_secret_jwt_key_2026')
JWT_ALGORITHM = 'HS256'

def encode_token(user):
    payload = {
        'id': user['id'],
        'email': user['email'],
        'role': user['role'],
        'exp': datetime.now(timezone.utc) + timedelta(days=7),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        token = None
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({
                'error': 'Authentication required. Please log in to access this resource.',
                'code': 'AUTH_REQUIRED'
            }), 401

        decoded = decode_token(token)
        if not decoded:
            return jsonify({
                'error': 'Invalid or expired session token. Please log in again.',
                'code': 'TOKEN_INVALID'
            }), 403

        user = get_user_by_id(decoded['id'])
        if not user:
            return jsonify({
                'error': 'User account no longer exists.',
                'code': 'USER_NOT_FOUND'
            }), 401

        if user.get('status') != 'active':
            return jsonify({
                'error': 'Your account has been deactivated.',
                'code': 'ACCOUNT_DEACTIVATED'
            }), 403

        g.current_user = user
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user.get('role') != 'admin':
            return jsonify({
                'error': 'Access denied. Administrator privileges are required.',
                'code': 'ADMIN_REQUIRED'
            }), 403
        return f(*args, **kwargs)
    return decorated

def optional_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        token = None
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        g.current_user = None
        if token:
            decoded = decode_token(token)
            if decoded:
                user = get_user_by_id(decoded['id'])
                if user and user.get('status') == 'active':
                    g.current_user = user
        return f(*args, **kwargs)
    return decorated
