const agentService = require('../services/AgentService');
const proposalStore = require('../services/proposalStore');

exports.scan = async (req, res, next) => {
  try {
    const proposals = await agentService.scanForDuplicates();
    res.json({ message: 'Scan complete', count: proposals.length });
  } catch (err) {
    next(err);
  }
};

exports.getProposals = async (req, res, next) => {
  try {
    // Only return those waiting for approval
    const proposals = proposalStore.getProposalsByStatus('WAITING_FOR_APPROVAL');
    res.json(proposals);
  } catch (err) {
    next(err);
  }
};

exports.getProposalById = async (req, res, next) => {
  try {
    const proposal = proposalStore.getProposal(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(proposal);
  } catch (err) {
    next(err);
  }
};

exports.approveProposal = async (req, res, next) => {
  try {
    const proposal = proposalStore.getProposal(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.status !== 'WAITING_FOR_APPROVAL') {
      return res.status(400).json({ error: `Cannot approve proposal in state ${proposal.status}` });
    }

    proposalStore.updateProposalStatus(req.params.id, 'APPROVED');
    const mergedContact = await agentService.executeMerge(req.params.id);
    
    res.json({ message: 'Merge successful', contact: mergedContact });
  } catch (err) {
    if (err.code === 'ER_TABLEACCESS_DENIED_ERROR') {
      return res.status(403).json({ error: 'This operation requires elevated database permissions that are currently unavailable.' });
    }
    next(err);
  }
};

exports.rejectProposal = async (req, res, next) => {
  try {
    const proposal = proposalStore.getProposal(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.status !== 'WAITING_FOR_APPROVAL') {
      return res.status(400).json({ error: `Cannot reject proposal in state ${proposal.status}` });
    }

    proposalStore.updateProposalStatus(req.params.id, 'REJECTED');
    res.json({ message: 'Proposal rejected successfully' });
  } catch (err) {
    next(err);
  }
};
