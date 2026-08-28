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

async function test() {
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
        console.log('\n--- 1. CREATE WITH NEW ORGANIZATION ---');
        const uniqueOrgName = 'Org' + Date.now();
        const email1 = `org1.${Date.now()}@test.com`;
        const phone1 = `9988${Math.floor(Math.random() * 1000000)}`;
        let res = await request('POST', '/api/contacts', {
            first_name: 'TestOrg',
            company_name: uniqueOrgName,
            email: email1,
            phone: phone1
        });
        const id1 = res.data.id;
        assert(res.status === 201, 'Contact 1 created successfully');
        assert(res.data.company_name === uniqueOrgName, 'Company name is set');

        console.log('\n--- 2. CREATE WITH EXISTING ORGANIZATION ---');
        const email2 = `org2.${Date.now()}@test.com`;
        const phone2 = `9988${Math.floor(Math.random() * 1000000)}`;
        res = await request('POST', '/api/contacts', {
            first_name: 'TestOrg2',
            company_name: uniqueOrgName,
            email: email2,
            phone: phone2
        });
        const id2 = res.data.id;
        assert(res.status === 201, 'Contact 2 created successfully');
        assert(res.data.company_name === uniqueOrgName, 'Reused company name successfully');

        console.log('\n--- 3. EMAIL UPDATE, CLEAR, AND OMIT ---');
        const newEmail = `newemail.${Date.now()}@test.com`;
        res = await request('PUT', `/api/contacts/${id1}`, { first_name: 'TestOrg', email: newEmail, phone: phone1 });
        if (res.status !== 200) console.error('PUT ERROR 1:', JSON.stringify(res.data));
        assert(res.data.email === newEmail, 'Email updated successfully');
        
        res = await request('PUT', `/api/contacts/${id1}`, { first_name: 'TestOrg', email: null, phone: phone1 });
        if (res.status !== 200) console.error('PUT ERROR 2:', JSON.stringify(res.data));
        console.log('CLEARED EMAIL RES:', res.data.email);
        assert(res.data.email === null, 'Email cleared successfully');
        
        res = await request('PUT', `/api/contacts/${id1}`, { first_name: 'StillNoEmail', phone: phone1 });
        if (res.status !== 200) console.error('PUT ERROR 3:', JSON.stringify(res.data));
        assert(res.data.email === null, 'Email remains cleared when omitted');

        console.log('\n--- 4. PHONE UPDATE, CLEAR, AND OMIT ---');
        const newPhone = `1122${Math.floor(Math.random() * 1000000)}`;
        res = await request('PUT', `/api/contacts/${id2}`, { first_name: 'TestOrg2', phone: newPhone, email: email2 });
        assert(res.data.phone === `+91${newPhone}`, 'Phone updated successfully');
        
        res = await request('PUT', `/api/contacts/${id2}`, { first_name: 'TestOrg2', phone: null, email: email2 });
        assert(res.data.phone === null, 'Phone cleared successfully');
        
        res = await request('PUT', `/api/contacts/${id2}`, { first_name: 'TestOrg2', last_name: 'Test', email: email2 });
        assert(res.data.phone === null, 'Phone remains cleared when omitted');

        console.log('\n--- 5. SOFT DELETE ---');
        let delRes = await request('DELETE', `/api/contacts/${id1}`);
        assert(delRes.status === 204, 'Contact 1 soft deleted');
        
        delRes = await request('DELETE', `/api/contacts/${id2}`);
        assert(delRes.status === 204, 'Contact 2 soft deleted');

        const getRes = await request('GET', `/api/contacts/${id1}`);
        assert(getRes.status === 404, 'Deleted contact returns 404');

        console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
        
    } catch (e) {
        console.error('Test script crashed', e);
    }
}

test();
