import React, { useState, useEffect } from 'react';
import { agentService } from '../services/api';

const ProposalModal = ({ proposalId, onClose }) => {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await agentService.getProposal(proposalId);
        setProposal(res.data);
      } catch (err) {
        setError('Failed to fetch proposal details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [proposalId]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await agentService.approveProposal(proposalId);
      onClose(true); // true indicates successful merge
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('Database permission denied during merge.');
      } else {
        setError(err.response?.data?.error || 'Failed to approve merge.');
      }
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await agentService.rejectProposal(proposalId);
      onClose(true); // act like successful merge to refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject proposal.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  if (!proposal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Merge Proposal</span>
          <span style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>{proposal.confidence}% Confidence</span>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Why the agent thinks these are duplicates:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {proposal.reasons.map((r, i) => (
              <li key={i} style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>✓ {r}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-main)' }}>Primary Contact</h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              <div><strong>Name:</strong> {proposal.primaryContact.first_name} {proposal.primaryContact.last_name}</div>
              {proposal.primaryContact.email && <div><strong>Email:</strong> {proposal.primaryContact.email}</div>}
              {proposal.primaryContact.phone && <div><strong>Phone:</strong> {proposal.primaryContact.phone}</div>}
              {proposal.primaryContact.company_name && <div><strong>Org:</strong> {proposal.primaryContact.company_name}</div>}
            </div>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--color-danger)' }}>Duplicate Contact</h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              <div><strong>Name:</strong> {proposal.duplicateContact.first_name} {proposal.duplicateContact.last_name}</div>
              {proposal.duplicateContact.email && <div><strong>Email:</strong> {proposal.duplicateContact.email}</div>}
              {proposal.duplicateContact.phone && <div><strong>Phone:</strong> {proposal.duplicateContact.phone}</div>}
              {proposal.duplicateContact.company_name && <div><strong>Org:</strong> {proposal.duplicateContact.company_name}</div>}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', border: '2px solid var(--color-primary)' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Proposed Result</h4>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
            <div><strong>Name:</strong> {proposal.proposedMergedContact.first_name} {proposal.proposedMergedContact.last_name}</div>
            {proposal.proposedMergedContact.email && <div><strong>Email:</strong> {proposal.proposedMergedContact.email}</div>}
            {proposal.proposedMergedContact.phone && <div><strong>Phone:</strong> {proposal.proposedMergedContact.phone}</div>}
            {proposal.proposedMergedContact.company_name && <div><strong>Org:</strong> {proposal.proposedMergedContact.company_name}</div>}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#d97706', fontWeight: '600', fontSize: '0.875rem' }}>
            STATUS: WAITING FOR APPROVAL
          </div>
          <div className="modal-actions">
            <button 
              className="btn btn-secondary" 
              onClick={handleReject}
              disabled={submitting}
            >
              Reject
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleApprove}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Approve Merge'}
            </button>
            <button 
              className="btn btn-ghost" 
              onClick={() => onClose(false)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;
