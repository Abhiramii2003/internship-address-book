import React from 'react';
import { Link } from 'react-router-dom';

const ContactCard = ({ contact, onDeleteClick }) => {
  return (
    <div className="contact-card">
      <div className="contact-name">
        {contact.first_name} {contact.last_name}
      </div>
      
      {contact.email && <div className="contact-detail">📧 {contact.email}</div>}
      {contact.phone && <div className="contact-detail">📱 {contact.phone}</div>}
      {contact.company_name && <div className="contact-detail">🏢 {contact.company_name}</div>}
      
      {contact.tags && contact.tags.length > 0 && (
        <div className="contact-tags">
          {contact.tags.map(tag => (
            <span key={tag.id} className="tag">{tag.name}</span>
          ))}
        </div>
      )}

      <div className="contact-actions">
        <Link to={`/edit/${contact.id}`} className="btn btn-secondary">Edit</Link>
        <button onClick={() => onDeleteClick(contact)} className="btn btn-danger">Delete</button>
      </div>
    </div>
  );
};

export default ContactCard;
