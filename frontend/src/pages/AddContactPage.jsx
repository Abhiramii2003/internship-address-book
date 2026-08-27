import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import { contactService } from '../services/api';

const AddContactPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      await contactService.createContact(formData);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to add contact';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Add New Contact</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <ContactForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default AddContactPage;
