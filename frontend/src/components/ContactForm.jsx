import React, { useState, useEffect } from 'react';
import TagSelector from './TagSelector';

const ContactForm = ({ initialData, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    notes: '',
    tagIds: []
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company_name: initialData.company_name || '',
        address_line1: initialData.address_line1 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postal_code: initialData.postal_code || '',
        country: initialData.country || '',
        notes: initialData.notes || '',
        tagIds: initialData.tags ? initialData.tags.map(t => t.id) : []
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setValidationError('');
  };

  const handleTagsChange = (newTagIds) => {
    setFormData({
      ...formData,
      tagIds: newTagIds
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name.trim()) {
      setValidationError('First name is required.');
      return;
    }
    if (!formData.email.trim() && !formData.phone.trim()) {
      setValidationError('At least one of Email or Phone must be provided.');
      return;
    }
    
    // Process empty strings to null for backend if needed, or let backend handle it
    const submitData = { ...formData };
    
    onSubmit(submitData);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      {validationError && <div className="alert alert-error">{validationError}</div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">First Name *</label>
          <input type="text" name="first_name" className="form-control" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input type="text" name="last_name" className="form-control" value={formData.last_name} onChange={handleChange} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Company Name</label>
        <input type="text" name="company_name" className="form-control" value={formData.company_name} onChange={handleChange} />
      </div>

      <TagSelector selectedTagIds={formData.tagIds} onChange={handleTagsChange} />

      <div className="form-group mt-1">
        <label className="form-label">Address Line 1</label>
        <input type="text" name="address_line1" className="form-control" value={formData.address_line1} onChange={handleChange} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">City</label>
          <input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">State</label>
          <input type="text" name="state" className="form-control" value={formData.state} onChange={handleChange} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Country</label>
          <input type="text" name="country" className="form-control" value={formData.country} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Postal Code</label>
          <input type="text" name="postal_code" className="form-control" value={formData.postal_code} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea name="notes" className="form-control" rows="3" value={formData.notes} onChange={handleChange}></textarea>
      </div>

      <div className="form-group mt-2">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
