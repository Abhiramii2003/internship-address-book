const Contact = require('../models/Contact');
const proposalStore = require('./proposalStore');

class AgentService {
  /**
   * Scan for duplicates and create proposals
   */
  async scanForDuplicates() {
    // 1. Fetch all active contacts (ignoring pagination by fetching a large limit, or ideally all)
    const result = await Contact.findAll({ limit: 10000 });
    const contacts = result.contacts || [];

    const proposals = [];
    const paired = new Set(); // to avoid duplicates like A-B and B-A

    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const c1 = contacts[i];
        const c2 = contacts[j];

        const pairKey = [c1.id, c2.id].sort().join('-');
        if (paired.has(pairKey)) continue;

        const { isDuplicate, confidence, reasons } = this.analyzePair(c1, c2);

        if (isDuplicate) {
          // Identify primary (older contact or one with more info)
          const primary = c1.id < c2.id ? c1 : c2;
          const duplicate = c1.id < c2.id ? c2 : c1;

          // Proposed merge
          const proposed = this.buildProposedMerge(primary, duplicate);

          const proposal = proposalStore.createProposal(primary, duplicate, confidence, reasons, proposed);
          proposals.push(proposal);
          paired.add(pairKey);
        }
      }
    }

    return proposals;
  }

  /**
   * Analyze two contacts for duplication signals
   */
  analyzePair(c1, c2) {
    const reasons = [];
    let score = 0;

    // Normalizations
    const email1 = c1.email ? c1.email.toLowerCase() : null;
    const email2 = c2.email ? c2.email.toLowerCase() : null;
    
    const phone1 = c1.phone ? c1.phone.replace(/[^\d]/g, '').slice(-10) : null;
    const phone2 = c2.phone ? c2.phone.replace(/[^\d]/g, '').slice(-10) : null;

    const name1 = (c1.first_name + ' ' + (c1.last_name || '')).trim().toLowerCase();
    const name2 = (c2.first_name + ' ' + (c2.last_name || '')).trim().toLowerCase();

    // 1. Exact Email Match
    if (email1 && email2 && email1 === email2) {
      reasons.push('Same email address');
      score += 60;
    }

    // 2. Exact Phone Match
    if (phone1 && phone2 && phone1 === phone2) {
      reasons.push('Same phone number');
      score += 50;
    }

    // 3. Exact Name Match
    if (name1 && name2 && name1 === name2) {
      reasons.push('Exact name match');
      score += 40;
    } else if (name1 && name2 && (name1.includes(name2) || name2.includes(name1))) {
      reasons.push('Similar name');
      score += 20;
    }

    // 4. Same Company
    const comp1 = c1.company_name ? c1.company_name.toLowerCase() : null;
    const comp2 = c2.company_name ? c2.company_name.toLowerCase() : null;
    if (comp1 && comp2 && comp1 === comp2) {
      reasons.push('Same organization');
      score += 15;
    }

    // Confidence mapping
    let confidence = 0;
    if (score >= 90) confidence = 98;
    else if (score >= 70) confidence = 85;
    else if (score >= 50) confidence = 75;
    else if (score >= 40) confidence = 60; // Name match only

    return {
      isDuplicate: confidence >= 60,
      confidence,
      reasons
    };
  }

  /**
   * Propose a merged result by taking the primary and backfilling missing fields from duplicate
   */
  buildProposedMerge(primary, duplicate) {
    const mergeTags = () => {
      const pTags = primary.tags || [];
      const dTags = duplicate.tags || [];
      const map = new Map();
      pTags.forEach(t => map.set(t.id, t));
      dTags.forEach(t => map.set(t.id, t));
      return Array.from(map.values());
    };

    const proposed = {};
    
    const setIfTruthy = (key, val) => {
      if (val !== null && val !== undefined && val !== '') {
        proposed[key] = val;
      }
    };

    setIfTruthy('first_name', primary.first_name || duplicate.first_name);
    setIfTruthy('last_name', primary.last_name || duplicate.last_name);
    setIfTruthy('email', primary.email || duplicate.email);
    setIfTruthy('phone', primary.phone || duplicate.phone);
    setIfTruthy('company_name', primary.company_name || duplicate.company_name);
    setIfTruthy('address_line1', primary.address_line1 || duplicate.address_line1);
    setIfTruthy('address_line2', primary.address_line2 || duplicate.address_line2);
    setIfTruthy('city', primary.city || duplicate.city);
    setIfTruthy('state', primary.state || duplicate.state);
    setIfTruthy('country', primary.country || duplicate.country);
    setIfTruthy('postal_code', primary.postal_code || duplicate.postal_code);
    setIfTruthy('notes', primary.notes || duplicate.notes);

    const mergedTags = mergeTags();
    if (mergedTags.length > 0) {
      proposed.tags = mergedTags;
      proposed.tagIds = mergedTags.map(t => t.id);
    }

    return proposed;
  }

  /**
   * Execute the merge operation transactionally.
   * Modifies Primary, Soft Deletes Duplicate.
   */
  async executeMerge(proposalId) {
    const proposal = proposalStore.getProposal(proposalId);
    if (!proposal) throw new Error('Proposal not found');

    if (proposal.status !== 'APPROVED') {
      throw new Error('Proposal must be APPROVED before merging.');
    }

    proposalStore.updateProposalStatus(proposalId, 'MERGING');

    try {
      const primaryId = proposal.primaryContact.id;
      const duplicateId = proposal.duplicateContact.id;

      // 1. Update the primary contact with merged fields
      await Contact.update(primaryId, proposal.proposedMergedContact);

      // 2. Soft-delete the duplicate contact
      // We rely on the existing Contact.delete which does an UPDATE is_active = 0.
      await Contact.delete(duplicateId);

      // 3. Mark successful
      proposalStore.updateProposalStatus(proposalId, 'MERGED');

      return await Contact.findById(primaryId);
    } catch (err) {
      proposalStore.updateProposalStatus(proposalId, 'FAILED');
      throw err;
    }
  }
}

module.exports = new AgentService();
