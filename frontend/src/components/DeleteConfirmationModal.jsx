import React, { useEffect, useRef } from 'react';

const DeleteConfirmationModal = ({ contact, onConfirm, onCancel }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    // Focus modal for accessibility
    if (modalRef.current) {
      modalRef.current.focus();
    }
    
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  if (!contact) return null;

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ');

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        tabIndex="-1"
        ref={modalRef}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--color-danger)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <h2 className="modal-title" id="modal-title" style={{ margin: 0 }}>Delete Contact?</h2>
        </div>
        
        <div className="modal-body">
          Are you sure you want to delete <strong>{fullName}</strong>?
          <br /><br />
          This action will remove the contact from your active contact list.
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={() => onConfirm(contact.id)}>
            Delete Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
