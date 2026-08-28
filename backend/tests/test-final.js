const http = require('http');

const request = (method, path, body = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch(e) {}
                resolve({ status: res.statusCode, data: parsed });
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

async function testFinal() {
    let passed = 0;
    let failed = 0;
    
    function assert(condition, message) {
        if (condition) {
            console.log(`PASS: ${message}`);
            passed++;
        } else {
            console.error(`FAIL: ${message}`);
            failed++;
        }
    }

    try {
        console.log('\n--- 1. GET CONTACTS ---');
        let res = await request('GET', '/api/contacts');
        assert(res.status === 200, 'Fetched contacts successfully');

        console.log('\n--- 2. CREATE TEMPORARY TAG ---');
        const tagName = `TempTag-${Date.now()}`;
        res = await request('POST', '/api/tags', { name: tagName });
        assert(res.status === 201, 'Created temp tag');
        const tagId = res.data.id;

        console.log('\n--- 3. CREATE TEMPORARY CONTACT ---');
        const email = `temp.${Date.now()}@test.com`;
        const phone = `9988${Math.floor(Math.random() * 1000000)}`;
        res = await request('POST', '/api/contacts', {
            first_name: 'TestFinal',
            email: email,
            phone: phone,
            tagIds: [tagId]
        });
        assert(res.status === 201, 'Created temp contact');
        const contactId = res.data.id;

        console.log('\n--- 4. GET CONTACT BY ID ---');
        res = await request('GET', `/api/contacts/${contactId}`);
        assert(res.status === 200, 'Fetched contact by ID');
        assert(res.data.email === email, 'Email matches');

        console.log('\n--- 5. PARTIAL UPDATE NORMAL FIELDS ---');
        res = await request('PUT', `/api/contacts/${contactId}`, { last_name: 'UpdatedName' });
        assert(res.status === 200, 'Partial update succeeded');
        assert(res.data.last_name === 'UpdatedName', 'Name updated');

        console.log('\n--- 6. UPDATE TAGS (SHOULD BE BLOCKED BY 403) ---');
        res = await request('PUT', `/api/contacts/${contactId}`, { tagIds: [] });
        console.log('STATUS:', res.status, 'DATA:', JSON.stringify(res.data));
        assert(res.status === 403, 'Tag update returned 403 Forbidden');
        assert(res.data && res.data.error && res.data.error.includes('elevated database permissions'), 'Correct error message');

        console.log('\n--- 7. CLEAR EMAIL (SHOULD BE BLOCKED BY 403) ---');
        res = await request('PUT', `/api/contacts/${contactId}`, { email: '' });
        assert(res.status === 403, 'Email clear returned 403 Forbidden');

        console.log('\n--- 8. CLEAR PHONE (SHOULD BE BLOCKED BY 403) ---');
        res = await request('PUT', `/api/contacts/${contactId}`, { phone: '' });
        assert(res.status === 403, 'Phone clear returned 403 Forbidden');

        console.log('\n--- 9. SOFT DELETE CONTACT ---');
        res = await request('DELETE', `/api/contacts/${contactId}`);
        assert(res.status === 204, 'Contact soft deleted');

        res = await request('GET', `/api/contacts/${contactId}`);
        assert(res.status === 404, 'Deleted contact is hidden');

        console.log('\n--- 10. SOFT DELETE TAG ---');
        res = await request('DELETE', `/api/tags/${tagId}`);
        assert(res.status === 204, 'Tag soft deleted');

        console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
    } catch (e) {
        console.error('Test script crashed', e);
    }
}

testFinal();
