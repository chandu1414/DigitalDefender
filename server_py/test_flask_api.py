import os
import io
import json
import unittest
from app import app
from seed import seed_database
from werkzeug.security import generate_password_hash
from db import get_connection, update_password, get_user_by_email

class TestFlaskAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database()
        # Reset sample user password for idempotent test runs
        alex = get_user_by_email('alex@example.com', include_password=True)
        if alex:
            update_password(alex['id'], generate_password_hash('UserPassword123!'))
        cls.client = app.test_client()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('status'), 'ok')
        print("[PASS] Health check passed.")

    def test_02_public_resources(self):
        res = self.client.get('/api/resources')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('resources', data)
        self.assertGreaterEqual(len(data['resources']), 5)
        print(f"[PASS] Public resources catalog returned {len(data['resources'])} items.")

    def test_03_gated_download_unauthenticated(self):
        res_list = self.client.get('/api/resources').get_json()['resources']
        test_id = res_list[0]['id']
        res = self.client.get(f'/api/resources/{test_id}/download')
        self.assertEqual(res.status_code, 401)
        data = res.get_json()
        self.assertEqual(data.get('code'), 'AUTH_REQUIRED')
        print("[PASS] Gated download properly blocked without authentication (401 AUTH_REQUIRED).")

    def test_04_user_signup_and_login(self):
        email = f"flask_tester_{int(os.times().system * 100000)}@example.com"
        # Signup
        signup_res = self.client.post('/api/auth/signup', json={
            'name': 'Flask Test User',
            'email': email,
            'password': 'SecurePassword123!'
        })
        self.assertEqual(signup_res.status_code, 201)
        data = signup_res.get_json()
        self.assertIn('token', data)
        self.assertNotIn('password_hash', data['user'])
        print("[PASS] User signup succeeded without password hash exposure.")

        # Login
        login_res = self.client.post('/api/auth/login', json={
            'email': email,
            'password': 'SecurePassword123!'
        })
        self.assertEqual(login_res.status_code, 200)
        login_data = login_res.get_json()
        self.assertIn('token', login_data)
        self.assertNotIn('password_hash', login_data['user'])
        print("[PASS] User login succeeded.")

    def test_05_authenticated_gated_download(self):
        # Login sample user
        login_res = self.client.post('/api/auth/login', json={
            'email': 'alex@example.com',
            'password': 'UserPassword123!'
        })
        self.assertEqual(login_res.status_code, 200)
        token = login_res.get_json()['token']

        res_list = self.client.get('/api/resources').get_json()['resources']
        test_id = res_list[0]['id']
        initial_downloads = res_list[0]['download_count']

        download_res = self.client.get(
            f'/api/resources/{test_id}/download',
            headers={'Authorization': f'Bearer {token}'}
        )
        self.assertEqual(download_res.status_code, 200)
        self.assertEqual(download_res.mimetype, 'application/pdf')
        print("[PASS] Authenticated gated download succeeded with PDF stream.")

        # Verify counter increment
        updated_list = self.client.get('/api/resources').get_json()['resources']
        updated_res = next(r for r in updated_list if r['id'] == test_id)
        self.assertEqual(updated_res['download_count'], initial_downloads + 1)
        print("[PASS] Resource download counter incremented successfully.")

    def test_06_admin_panel_security_and_management(self):
        # Login admin
        admin_res = self.client.post('/api/auth/login', json={
            'email': 'admin@digitaldefender.io',
            'password': 'AdminPassword2026!'
        })
        self.assertEqual(admin_res.status_code, 200)
        admin_token = admin_res.get_json()['token']

        # Get stats
        stats_res = self.client.get('/api/admin/stats', headers={'Authorization': f'Bearer {admin_token}'})
        self.assertEqual(stats_res.status_code, 200)
        print("[PASS] Admin stats endpoint verified.")

        # Get users list
        users_res = self.client.get('/api/admin/users', headers={'Authorization': f'Bearer {admin_token}'})
        self.assertEqual(users_res.status_code, 200)
        users = users_res.get_json()['users']
        self.assertGreaterEqual(len(users), 2)
        # Verify ZERO passwords exposed
        for u in users:
            self.assertNotIn('password', u)
            self.assertNotIn('password_hash', u)
        print(f"[PASS] Admin user list verified: {len(users)} users, zero passwords or hashes exposed.")

        # Search users
        search_res = self.client.get('/api/admin/users?search=alex', headers={'Authorization': f'Bearer {admin_token}'})
        self.assertEqual(search_res.status_code, 200)
        matched = search_res.get_json()['users']
        self.assertEqual(len(matched), 1)
        self.assertEqual(matched[0]['email'], 'alex@example.com')
        print("[PASS] Admin user search filter verified.")

    def test_07_admin_upload_pdf(self):
        admin_res = self.client.post('/api/auth/login', json={
            'email': 'admin@digitaldefender.io',
            'password': 'AdminPassword2026!'
        })
        admin_token = admin_res.get_json()['token']

        dummy_pdf = io.BytesIO(b'%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF')

        upload_res = self.client.post(
            '/api/admin/resources',
            headers={'Authorization': f'Bearer {admin_token}'},
            data={
                'title': 'Flask Zero Trust Architecture 2026',
                'topic': 'Cybersecurity',
                'description': 'A test guide uploaded via Python Flask.',
                'author': 'Flask Admin',
                'pdf': (dummy_pdf, 'flask_test_guide.pdf', 'application/pdf')
            },
            content_type='multipart/form-data'
        )
        self.assertEqual(upload_res.status_code, 201)
        print("[PASS] Admin PDF upload verified.")

        # Verify in public catalog
        cat = self.client.get('/api/resources').get_json()['resources']
        found = any(r['title'] == 'Flask Zero Trust Architecture 2026' for r in cat)
        self.assertTrue(found)
        print("[PASS] Uploaded PDF immediately visible in public catalog.")

    def test_08_password_reset_flow(self):
        forgot_res = self.client.post('/api/auth/forgot-password', json={'email': 'alex@example.com'})
        self.assertEqual(forgot_res.status_code, 200)
        token = forgot_res.get_json().get('resetToken')
        self.assertTrue(bool(token))

        reset_res = self.client.post('/api/auth/reset-password', json={
            'token': token,
            'newPassword': 'NewUserPassword2026!'
        })
        self.assertEqual(reset_res.status_code, 200)

        # Login with new password
        login_res = self.client.post('/api/auth/login', json={
            'email': 'alex@example.com',
            'password': 'NewUserPassword2026!'
        })
        self.assertEqual(login_res.status_code, 200)
        print("[PASS] Full forgot & reset password flow verified successfully.")

if __name__ == '__main__':
    unittest.main()
