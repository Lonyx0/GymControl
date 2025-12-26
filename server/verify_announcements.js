const API_URL = 'http://localhost:5001/api';
let adminToken = '';
let announcementId = '';

async function loginAdmin() {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'password123'
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Login failed');

        adminToken = data.token;
        console.log('✅ Admin login successful');
    } catch (err) {
        console.error('❌ Admin login failed:', err.message);
        process.exit(1);
    }
}

async function createAnnouncement() {
    try {
        const res = await fetch(`${API_URL}/announcements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': adminToken
            },
            body: JSON.stringify({
                title: 'Test Duyuru',
                content: 'Bu bir test duyurusudur.'
            })
        });

        const text = await res.text();
        try {
            const data = JSON.parse(text);
            if (!res.ok) throw new Error(data.msg || 'Create failed');
            announcementId = data._id;
            console.log('✅ Create Announcement successful');
        } catch (e) {
            console.error('❌ Create Announcement JSON Parse Error. Response Body:', text);
        }

    } catch (err) {
        console.error('❌ Create Announcement failed:', err.message);
    }
}

async function getAnnouncements() {
    try {
        const res = await fetch(`${API_URL}/announcements`);
        const data = await res.json();

        if (data.length > 0 && data[0].title === 'Test Duyuru') {
            console.log('✅ Get Announcements successful');
        } else {
            console.log('❌ Get Announcements returned unexpected data');
        }
    } catch (err) {
        console.error('❌ Get Announcements failed:', err.message);
    }
}

async function deleteAnnouncement() {
    try {
        const res = await fetch(`${API_URL}/announcements/${announcementId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': adminToken }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Delete failed');

        console.log('✅ Delete Announcement successful');
    } catch (err) {
        console.error('❌ Delete Announcement failed:', err.message);
    }
}

async function run() {
    await loginAdmin();
    await createAnnouncement();
    await getAnnouncements();
    await deleteAnnouncement();
}

run();
