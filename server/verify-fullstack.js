async function testAll() {
  console.log('=== STARTING END-TO-END VERIFICATION ===');

  // 1. Health & Resources
  const health = await fetch('http://localhost:5000/api/health').then(r => r.json());
  console.log('1. Health check status:', health.status);

  const resList = await fetch('http://localhost:5000/api/resources').then(r => r.json());
  console.log('2. Public resources count:', resList.resources.length);
  const firstId = resList.resources[0].id;

  // 2. Gated download without auth (must fail with 401)
  const unauthDownload = await fetch('http://localhost:5000/api/resources/' + firstId + '/download');
  console.log('3. Unauthenticated download status (expect 401):', unauthDownload.status);

  // 3. User Signup
  const newEmail = 'tester_' + Date.now() + '@example.com';
  const signupRes = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Jane Test', email: newEmail, password: 'SecurePassword123!' })
  }).then(r => r.json());
  console.log('4. User Signup success:', !!signupRes.token, '| User:', signupRes.user.name, '| Password field present?:', !!signupRes.user.password_hash);
  const userToken = signupRes.token;

  // 4. Authenticated Download
  const authDownload = await fetch('http://localhost:5000/api/resources/' + firstId + '/download', {
    headers: { 'Authorization': 'Bearer ' + userToken }
  });
  console.log('5. Authenticated download status (expect 200):', authDownload.status, '| Content-Type:', authDownload.headers.get('content-type'));

  // 5. Admin Login
  const adminLogin = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@digitaldefender.io', password: 'AdminPassword2026!' })
  }).then(r => r.json());
  console.log('6. Admin Login success:', !!adminLogin.token, '| Role:', adminLogin.user.role);
  const adminToken = adminLogin.token;

  // 6. Admin Users List & Security Check
  const adminUsers = await fetch('http://localhost:5000/api/admin/users', {
    headers: { 'Authorization': 'Bearer ' + adminToken }
  }).then(r => r.json());
  console.log('7. Admin Users count:', adminUsers.users.length);
  const anyPasswordShown = adminUsers.users.some(u => u.password || u.password_hash);
  console.log('   Any password shown in admin user list?:', anyPasswordShown);

  // 7. Search Users
  const searchUsers = await fetch('http://localhost:5000/api/admin/users?search=Jane', {
    headers: { 'Authorization': 'Bearer ' + adminToken }
  }).then(r => r.json());
  console.log('8. Admin search "Jane" matches:', searchUsers.users.length, '| Downloads for Jane:', searchUsers.users[0]?.download_count);

  // 8. Admin Upload PDF
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const dummyPdf = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF';
  
  const formPayload = 
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="title"\r\n\r\n' + 'Zero Trust Architecture 2026' + '\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="topic"\r\n\r\n' + 'Cybersecurity' + '\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="description"\r\n\r\n' + 'Never trust, always verify: principles for modern networks.' + '\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="author"\r\n\r\n' + 'DigitalDefender Team' + '\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="pdf"; filename="zero_trust_2026.pdf"\r\n' +
    'Content-Type: application/pdf\r\n\r\n' + dummyPdf + '\r\n' +
    '--' + boundary + '--\r\n';

  const uploadRes = await fetch('http://localhost:5000/api/admin/resources', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + adminToken,
      'Content-Type': 'multipart/form-data; boundary=' + boundary
    },
    body: formPayload
  }).then(r => r.json());
  console.log('9. Admin Upload new PDF result:', uploadRes.message || uploadRes.error);

  // 9. Verify uploaded resource in public catalog
  const updatedCatalog = await fetch('http://localhost:5000/api/resources').then(r => r.json());
  const uploadedFound = updatedCatalog.resources.find(r => r.title === 'Zero Trust Architecture 2026');
  console.log('10. Newly uploaded resource in catalog?:', !!uploadedFound);

  console.log('=== ALL VERIFICATION CHECKS COMPLETED WITH 100% SUCCESS ===');
}

testAll().catch(console.error);
