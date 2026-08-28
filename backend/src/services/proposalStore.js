const { v4: uuidv4 } = require('uuid');

class ProposalStore {
  constructor() {
    this.proposals = new Map();
  }

  createProposal(primaryContact, duplicateContact, confidence, reasons, proposedMergedContact) {
    const id = uuidv4();
    const proposal = {
      id,
      primaryContact,
      duplicateContact,
      confidence,
      reasons,
      proposedMergedContact,
      status: 'WAITING_FOR_APPROVAL',
      createdAt: new Date().toISOString()
    };
    this.proposals.set(id, proposal);
    return proposal;
  }

  getProposal(id) {
    return this.proposals.get(id);
  }

  getProposalsByStatus(status) {
    const result = [];
    for (const proposal of this.proposals.values()) {
      if (proposal.status === status) {
        result.push(proposal);
      }
    }
    // Sort by newest first
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  updateProposalStatus(id, newStatus) {
    const proposal = this.proposals.get(id);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    const validTransitions = {
      'WAITING_FOR_APPROVAL': ['APPROVED', 'REJECTED'],
      'APPROVED': ['MERGING'],
      'MERGING': ['MERGED', 'FAILED'],
      'REJECTED': [],
      'MERGED': [],
      'FAILED': []
    };

    if (!validTransitions[proposal.status].includes(newStatus)) {
      throw new Error(`Invalid state transition from ${proposal.status} to ${newStatus}`);
    }

    proposal.status = newStatus;
    return proposal;
  }

  clear() {
    this.proposals.clear();
  }
}

// Export a singleton instance
module.exports = new ProposalStore();
