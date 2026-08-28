import React, { useState, useEffect } from 'react';
import { agentService } from '../services/api';
import ProposalModal from '../components/ProposalModal';

const AgentPage = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await agentService.getProposals();
      setProposals(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch proposals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      await agentService.scan();
      await fetchProposals();
      setError(null);
    } catch (err) {
      setError('Failed to scan for duplicates.');
    } finally {
      setScanning(false);
    }
  };

  const handleProposalClose = (merged) => {
    setSelectedProposal(null);
    if (merged) {
      fetchProposals();
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Address Book Agent</h1>
          <p className="page-subtitle">Automatically detect duplicates and propose merges.</p>
        </div>
        <div>
          <button 
            className="btn btn-primary" 
            onClick={handleScan} 
            disabled={scanning}
          >
            {scanning ? 'Scanning...' : 'Scan for Duplicates'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Potential Duplicates</h2>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
          </div>
        ) : proposals.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div className="empty-title">All Good!</div>
            <div className="empty-desc">No duplicates found in your address book.</div>
          </div>
        ) : (
          <div className="contact-grid">
            {proposals.map(proposal => (
              <div key={proposal.id} className="contact-card">
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: '600' }}>
                    {proposal.primaryContact.first_name} {proposal.primaryContact.last_name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    vs {proposal.duplicateContact.first_name} {proposal.duplicateContact.last_name}
                  </div>
                </div>
                
                <div style={{ color: 'var(--color-primary)', fontWeight: '600', marginBottom: '1rem' }}>
                  {proposal.confidence}% Match
                </div>

                <div className="contact-details">
                  {proposal.reasons.map((r, i) => (
                    <div key={i} className="contact-detail-item">✓ {r}</div>
                  ))}
                </div>

                <div className="contact-actions">
                  <button className="btn btn-secondary" onClick={() => setSelectedProposal(proposal)}>
                    View Proposal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProposal && (
        <ProposalModal 
          proposalId={selectedProposal.id} 
          onClose={handleProposalClose} 
        />
      )}
    </div>
  );
};

export default AgentPage;
