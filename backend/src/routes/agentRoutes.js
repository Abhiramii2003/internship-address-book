const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

router.post('/scan', agentController.scan);
router.get('/proposals', agentController.getProposals);
router.get('/proposals/:id', agentController.getProposalById);
router.post('/proposals/:id/approve', agentController.approveProposal);
router.post('/proposals/:id/reject', agentController.rejectProposal);

module.exports = router;
