import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import { contactService } from '../services/api';

const EditContactPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await contactService.getContact(id);
        setInitialData(response.data);
      } catch (err) {
        setError('Failed to load contact details.');
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      await contactService.updateContact(id, formData);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to update contact';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Edit Contact</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {initialData && (
        <ContactForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      )}
    </div>
  );
};

export default EditContactPage;
