import React from 'react';
import { Link } from 'react-router-dom';

const ContactCard = ({ contact, onDeleteClick }) => {
  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}` || '?';
  };

  // Generate a deterministic color based on the contact's name
  const getAvatarColor = (name) => {
    const colors = ['#2563eb', '#059669', '#dc2626', '#d97706', '#7c3aed', '#db2777', '#0891b2'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ');

  return (
    <div className="contact-card">
      <div className="contact-card-header">
        <div 
          className="contact-avatar" 
          style={{ backgroundColor: getAvatarColor(fullName) }}
        >
          {getInitials(contact.first_name, contact.last_name)}
        </div>
        <div className="contact-info">
          <div className="contact-name" title={fullName}>{fullName}</div>
          {contact.company_name && (
            <div className="contact-company" title={contact.company_name}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <path d="M9 22v-4h6v4"></path>
                <path d="M8 6h.01"></path>
                <path d="M16 6h.01"></path>
                <path d="M12 6h.01"></path>
                <path d="M12 10h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 10h.01"></path>
                <path d="M16 14h.01"></path>
                <path d="M8 10h.01"></path>
                <path d="M8 14h.01"></path>
              </svg>
              {contact.company_name}
            </div>
          )}
        </div>
      </div>
      
      <div className="contact-details">
        {contact.email && (
          <div className="contact-detail-item" title={contact.email}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            {contact.email}
          </div>
        )}
        {contact.phone && (
          <div className="contact-detail-item" title={contact.phone}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            {contact.phone}
          </div>
        )}
      </div>
      
      {contact.tags && contact.tags.length > 0 && (
        <div className="contact-tags">
          {contact.tags.map(tag => (
            <span key={tag.id} className="tag">{tag.name}</span>
          ))}
        </div>
      )}

      <div className="contact-actions">
        <Link to={`/edit/${contact.id}`} className="btn btn-ghost btn-icon" title="Edit Contact">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span className="sr-only" style={{ display: 'none' }}>Edit</span>
        </Link>
        <button onClick={() => onDeleteClick(contact)} className="btn btn-ghost btn-icon danger" title="Delete Contact">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span className="sr-only" style={{ display: 'none' }}>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default ContactCard;
