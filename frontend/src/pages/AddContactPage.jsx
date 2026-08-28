import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contactService } from '../services/api';
import ContactForm from '../components/ContactForm';

const AddContactPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getFriendlyErrorMessage = (err) => {
    if (!err.response) return 'Unable to connect to the server. Please check your internet connection.';
    const status = err.response.status;
    if (status === 403) return 'This operation requires elevated database permissions that are currently unavailable.';
    if (status === 409) return 'A contact with this email or phone number already exists.';
    if (status >= 500) return 'Something went wrong on our end. Please try again later.';
    return err.response.data?.error || 'Failed to create contact.';
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      await contactService.createContact(data);
      navigate('/');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" className="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Contacts
      </Link>
      
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div className="page-title">
          <h1>Add Contact</h1>
          <p className="page-subtitle">Create a new contact record.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}

      <ContactForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
};

export default AddContactPage;
