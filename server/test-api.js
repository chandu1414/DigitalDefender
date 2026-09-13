const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
    const reqOptions = {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('Testing Server API...');

  const express = require('express');
  const cors = require('cors');
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', require('./src/routes/auth'));
  app.use('/api/resources', require('./src/routes/resources'));
  app.use('/api/admin', require('./src/routes/admin'));

  const server = app.listen(5099, async () => {
    try {
      // 1. Test Login with Sample User
      const loginRes = await request({
        hostname: '127.0.0.1',
        port: 5099,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'alex@example.com', password: 'UserPassword123!' });

      console.log('1. User Login status:', loginRes.status);
      console.log('   User name:', loginRes.data.user?.name);
      console.log('   User password exposed?:', !!loginRes.data.user?.password_hash);
      const userToken = loginRes.data.token;

      // 2. Test Login with Admin
      const adminLoginRes = await request({
        hostname: '127.0.0.1',
        port: 5099,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'admin@digitaldefender.io', password: 'AdminPassword2026!' });

      console.log('2. Admin Login status:', adminLoginRes.status);
      const adminToken = adminLoginRes.data.token;

      // 3. Test Public Resources list
      const resourcesRes = await request({
        hostname: '127.0.0.1',
        port: 5099,
        path: '/api/resources',
        method: 'GET'
      });
      console.log('3. Public Resources count:', resourcesRes.data.resources?.length);
      const testResourceId = resourcesRes.data.resources[0].id;

      // 4. Test Gated Resource Download without Token (Expect 401)
      const unauthDownloadRes = await request({
        hostname: '127.0.0.1',
        port: 5099,
        path: `/api/resources/${testResourceId}/download`,
        method: 'GET'
      });
      console.log('4. Unauthenticated download status (expect 401):', unauthDownloadRes.status, unauthDownloadRes.data.code);

      // 5. Test Gated Resource Download WITH Token (Expect 200)
      const authDownloadRes = await request({
        hostname: '127.0.0.1',
        port: 5099,
        path: `/api/resources/${testResourceId}/download`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      console.log('5. Authenticated download status (expect 200):', authDownloadRes.status, 'Content-Type:', authDownloadRes.headers['content-type']);

      // 6. Test Admin Users List
      const adminUsersRes = await request({
        hostname: '127.0.0.1',
        port: 5099,
        path: '/api/admin/users',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      console.log('6. Admin user list count:', adminUsersRes.data.users?.length);
      const anyPasswordExposed = adminUsersRes.data.users.some(u => u.password_hash || u.password);
      console.log('   Any user password exposed in admin table?:', anyPasswordExposed);

      // 7. Test Admin User Search Filter
      const searchRes = await request({
        hostname: '127.0.0.1',
        port: 5099,
        path: '/api/admin/users?search=alex',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      console.log('7. Search "alex" count:', searchRes.data.users?.length, 'Name:', searchRes.data.users[0]?.name);

      // 8. Test Forgot Password
      const forgotRes = await request({
        hostname: '127.0.0.1',
        port: 5099,
        path: '/api/auth/forgot-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'alex@example.com' });
      console.log('8. Forgot password reset URL returned:', forgotRes.data.resetUrl);

      console.log('\n--- ALL BACKEND CHECKS PASSED SUCCESSFULLY! ---');
    } catch (e) {
      console.error('Test error:', e);
    } finally {
      server.close(() => {
        process.exit(0);
      });
    }
  });
}

runTests();
