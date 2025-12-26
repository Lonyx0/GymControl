const http = require('http');

// Helper wrapper for making HTTP requests
function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body || '{}') });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    const email = `admin_${Date.now()}@test.com`; // Unique email
    console.log(`Testing with email: ${email}`);

    // 1. REGISTER
    console.log('\n--- 1. Register Admin ---');
    const regRes = await request({
        hostname: 'localhost',
        port: 5001,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        name: 'Admin User',
        email: email,
        password: 'password123',
        gender: 'male',
        role: 'admin'
    });
    console.log('Status:', regRes.status);
    console.log('Token received:', !!regRes.body.token);

    const token = regRes.body.token;
    if (!token) {
        console.error('Registration failed, aborting tests.');
        return;
    }

    // 2. CREATE SESSION
    console.log('\n--- 2. Create Session (Admin) ---');
    const sessionRes = await request({
        hostname: 'localhost',
        port: 5001,
        path: '/api/sessions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        }
    }, {
        title: 'Morning Yoga',
        instructor: 'Jane Doe',
        date: new Date().toISOString(),
        startTime: '09:00',
        duration: 60,
        type: 'mixed',
        capacity: 15
    });
    console.log('Status:', sessionRes.status);
    console.log('Session ID:', sessionRes.body?._id);

    // 3. GET SESSIONS
    console.log('\n--- 3. List Sessions ---');
    const listRes = await request({
        hostname: 'localhost',
        port: 5001,
        path: '/api/sessions',
        method: 'GET'
    });
    console.log('Status:', listRes.status);
    console.log('Sessions count:', Array.isArray(listRes.body) ? listRes.body.length : 'Error');

    console.log('\nVerification Complete.');
}

runTests().catch(console.error);
