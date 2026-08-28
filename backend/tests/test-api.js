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

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

async function test() {
    try {
        console.log('Testing GET /api/contacts');
        let res = await request('GET', '/api/contacts');
        console.log(`Status: ${res.status}`);
        if (res.data.contacts && res.data.contacts.length > 0) {
            console.log(`First contact id: ${res.data.contacts[0].id}, email: ${res.data.contacts[0].email}, name: ${res.data.contacts[0].display_name}`);
        }

        console.log('\nTesting GET /api/contacts/3 (Jane Doe)');
        res = await request('GET', '/api/contacts/3');
        console.log(`Status: ${res.status}, Name: ${res.data.display_name}, Email: ${res.data.email}, Phone: ${res.data.phone}`);

        console.log('\nTesting GET /api/tags (Categories)');
        res = await request('GET', '/api/tags');
        console.log(`Status: ${res.status}, Categories Count: ${res.data.length}`);

        console.log('\nTesting POST /api/contacts');
        const postData = {
            first_name: 'Test',
            last_name: 'Contact',
            email: `test.contact.${Date.now()}@example.com`,
            phone: `+9199${Math.floor(Math.random() * 100000000)}`,
            company_name: 'Test Corp',
            city: 'Test City',
            tagIds: [1, 2]
        };
        res = await request('POST', '/api/contacts', postData);
        console.log(`Status: ${res.status}`);
        const createdId = res.data.id;
        console.log(`Created ID: ${createdId}`);

        if (createdId) {
            console.log('\nTesting PUT /api/contacts/' + createdId);
            const putData = {
                ...postData,
                first_name: 'Test Updated',
                tagIds: [3]
            };
            res = await request('PUT', `/api/contacts/${createdId}`, putData);
            console.log(`Status: ${res.status}`);

            console.log('\nTesting DELETE /api/contacts/' + createdId);
            res = await request('DELETE', `/api/contacts/${createdId}`);
            console.log(`Status: ${res.status}`);

            console.log('\nVerifying DELETE /api/contacts/' + createdId);
            res = await request('GET', `/api/contacts/${createdId}`);
            console.log(`Status: ${res.status} (Expected 404)`);
        }

    } catch (e) {
        console.error('Test failed', e);
    }
}

test();
