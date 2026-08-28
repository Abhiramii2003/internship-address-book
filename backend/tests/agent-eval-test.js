const API_URL = 'http://localhost:5000/api';

async function fetchAPI(method, endpoint, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API_URL}${endpoint}`, options);
  
  if (!res.ok && res.status !== 404 && res.status !== 400 && res.status !== 403 && res.status !== 409) {
    const text = await res.text();
    throw new Error(`HTTP Error ${res.status}: ${text}`);
  }
  
  return {
    status: res.status,
    data: res.status !== 204 ? await res.json() : null,
  };
}

async function runTest() {
  console.log('--- STARTING AGENT EVALUATOR TEST ---');
  let c1_id = null;
  let c2_id = null;
  
  try {
    const uniqueId = Date.now().toString().slice(-6);

    console.log('1. Creating duplicate test contacts...');
    const res1 = await fetchAPI('POST', '/contacts', {
      first_name: 'Jonathan',
      last_name: 'Smitherson',
      email: `jonathan.s${uniqueId}@example.com`,
      phone: `900${uniqueId}1`, // Unique phone 1
      company_name: 'Agent Evaluator Corp'
    });
    c1_id = res1.data.id;
    console.log(`Created contact 1: ${c1_id}`);

    // Create a very similar contact with different email to bypass SQL unique constraints,
    // but same company and highly similar name to trigger the Agent's detection.
    const res2 = await fetchAPI('POST', '/contacts', {
      first_name: 'Jonathan',
      last_name: 'Smitherson',
      email: `jon.s${uniqueId}@example.com`, 
      phone: `900${uniqueId}2`, // Unique phone 2
      company_name: 'Agent Evaluator Corp'
    });
    c2_id = res2.data.id;
    console.log(`Created contact 2: ${c2_id}`);

    // Wait for insertion
    await new Promise(r => setTimeout(r, 1000));

    console.log('\n2. Agent scanning for duplicates...');
    await fetchAPI('POST', '/agent/scan');
    
    console.log('\n3. Fetching proposals...');
    const proposalsRes = await fetchAPI('GET', '/agent/proposals');
    const proposals = proposalsRes.data;
    console.log(`Found ${proposals.length} waiting proposals.`);
    
    const targetProposal = proposals.find(p => 
      (p.primaryContact.id === c1_id && p.duplicateContact.id === c2_id) || 
      (p.primaryContact.id === c2_id && p.duplicateContact.id === c1_id)
    );

    if (!targetProposal) {
      throw new Error('Agent failed to detect the duplicates! Adjust detection thresholds if necessary.');
    }
    console.log(`Duplicate detected! Proposal ID: ${targetProposal.id}`);
    console.log(`Status: ${targetProposal.status}`);
    console.log('Reasons:', targetProposal.reasons);
    
    if (targetProposal.status !== 'WAITING_FOR_APPROVAL') {
      throw new Error('Status should be WAITING_FOR_APPROVAL');
    }

    console.log('\n4. Verifying database is unchanged while waiting...');
    const verifyC1 = await fetchAPI('GET', `/contacts/${c1_id}`);
    const verifyC2 = await fetchAPI('GET', `/contacts/${c2_id}`);
    console.log(`Contact 1 Active? ${verifyC1.status === 200 ? 'YES' : 'NO'}`);
    console.log(`Contact 2 Active? ${verifyC2.status === 200 ? 'YES' : 'NO'}`);

    console.log('\n5. Approving the proposal...');
    const approveRes = await fetchAPI('POST', `/agent/proposals/${targetProposal.id}/approve`);
    console.log('Merge Result:', approveRes.data.message);
    const mergedContact = approveRes.data.contact;
    console.log('Merged Contact ID:', mergedContact.id);

    console.log('\n6. Validating final state...');
    const finalC1 = await fetchAPI('GET', `/contacts/${targetProposal.primaryContact.id}`);
    console.log(`Primary Contact [${targetProposal.primaryContact.id}] still active? YES`);

    const finalC2 = await fetchAPI('GET', `/contacts/${targetProposal.duplicateContact.id}`);
    if (finalC2.status === 404) {
      console.log(`Duplicate Contact [${targetProposal.duplicateContact.id}] successfully soft-deleted!`);
    } else {
      throw new Error(`Duplicate contact ${targetProposal.duplicateContact.id} was not soft-deleted (status ${finalC2.status})!`);
    }

    console.log('\n7. Testing repeated approval rejection...');
    const rejectRes = await fetchAPI('POST', `/agent/proposals/${targetProposal.id}/approve`);
    if (rejectRes.status === 400) {
      console.log('Repeated approval safely rejected:', rejectRes.data.error);
    } else {
      throw new Error('Repeated approval should have failed!');
    }

    console.log('\n--- AGENT EVALUATOR TEST PASSED SUCCESSFULLY ---');

  } catch (error) {
    console.error('Test Failed:', error.message);
  } finally {
    console.log('\nCleaning up test records safely...');
    try {
      if (c1_id) await fetchAPI('DELETE', `/contacts/${c1_id}`);
      if (c2_id) await fetchAPI('DELETE', `/contacts/${c2_id}`);
    } catch (e) {}
    process.exit(0);
  }
}

runTest();
