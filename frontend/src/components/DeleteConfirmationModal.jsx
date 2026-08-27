import React from 'react';

const DeleteConfirmationModal = ({ contact, onConfirm, onCancel }) => {
  if (!contact) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Deletion</h3>
        <p className="mt-1">
          Are you sure you want to delete <strong>{contact.first_name} {contact.last_name}</strong>?
        </p>
        <p className="form-error">This action cannot be undone.</p>
        
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={() => onConfirm(contact.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
