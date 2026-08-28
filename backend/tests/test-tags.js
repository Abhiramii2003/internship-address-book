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

async function testTags() {
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
        console.log('\n--- 1. GET INITIAL TAGS ---');
        let res = await request('GET', '/api/tags');
        assert(res.status === 200, 'Tags fetched successfully');
        const initialCount = res.data.length;
        console.log(`Initial active tags count: ${initialCount}`);

        console.log('\n--- 2. CREATE TEST TAG ---');
        const testTagName = `TestTag-${Date.now()}`;
        res = await request('POST', '/api/tags', { name: testTagName });
        assert(res.status === 201, 'Test tag created');
        const newTagId = res.data.id;

        console.log('\n--- 3. VERIFY CREATED TAG APPEARS ---');
        res = await request('GET', '/api/tags');
        assert(res.data.length === initialCount + 1, 'Tag count increased by 1');
        assert(res.data.some(t => t.id === newTagId), 'Test tag is in the list');

        console.log('\n--- 4. SOFT DELETE TEST TAG ---');
        res = await request('DELETE', `/api/tags/${newTagId}`);
        assert(res.status === 204, 'Test tag soft deleted successfully');

        console.log('\n--- 5. VERIFY DELETED TAG IS HIDDEN ---');
        res = await request('GET', '/api/tags');
        assert(res.data.length === initialCount, 'Tag count returned to initial');
        assert(!res.data.some(t => t.id === newTagId), 'Test tag is no longer in the list');

        console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
    } catch (e) {
        console.error('Test script crashed', e);
    }
}

testTags();
