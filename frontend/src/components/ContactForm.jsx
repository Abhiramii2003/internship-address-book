import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TagSelector from './TagSelector';

const ContactForm = ({ initialData, onSubmit, isSubmitting }) => {
  const navigate = useNavigate();
  
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

  const [validationErrors, setValidationErrors] = useState({});

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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear specific field error when user starts typing
    if (validationErrors[name] || validationErrors.general) {
      setValidationErrors(prev => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const handleTagsChange = (newTagIds) => {
    setFormData({
      ...formData,
      tagIds: newTagIds
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!formData.email.trim() && !formData.phone.trim()) {
      errors.general = 'At least one of Email or Phone must be provided';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    const submitData = { ...formData };
    onSubmit(submitData);
  };

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      {validationErrors.general && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {validationErrors.general}
        </div>
      )}
      
      <div className="form-section">
        <h3 className="form-section-title">Personal Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="first_name">First Name <span style={{color: 'var(--color-danger)'}}>*</span></label>
            <input 
              type="text" 
              id="first_name"
              name="first_name" 
              className={`form-control ${validationErrors.first_name ? 'error' : ''}`} 
              value={formData.first_name} 
              onChange={handleChange} 
            />
            {validationErrors.first_name && <div className="form-error">{validationErrors.first_name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="last_name">Last Name</label>
            <input 
              type="text" 
              id="last_name"
              name="last_name" 
              className="form-control" 
              value={formData.last_name} 
              onChange={handleChange} 
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Contact Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              name="email" 
              className="form-control" 
              value={formData.email} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone</label>
            <input 
              type="tel" 
              id="phone"
              name="phone" 
              className="form-control" 
              value={formData.phone} 
              onChange={handleChange} 
            />
          </div>
        </div>
        
        <div className="form-group" style={{marginTop: '1rem'}}>
          <label className="form-label" htmlFor="company_name">Company / Organization</label>
          <input 
            type="text" 
            id="company_name"
            name="company_name" 
            className="form-control" 
            value={formData.company_name} 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Tags & Categories</h3>
        <TagSelector selectedTagIds={formData.tagIds} onChange={handleTagsChange} />
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Address</h3>
        <div className="form-group">
          <label className="form-label" htmlFor="address_line1">Address Line 1</label>
          <input 
            type="text" 
            id="address_line1"
            name="address_line1" 
            className="form-control" 
            value={formData.address_line1} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="city">City</label>
            <input 
              type="text" 
              id="city"
              name="city" 
              className="form-control" 
              value={formData.city} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="state">State</label>
            <input 
              type="text" 
              id="state"
              name="state" 
              className="form-control" 
              value={formData.state} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="country">Country</label>
            <input 
              type="text" 
              id="country"
              name="country" 
              className="form-control" 
              value={formData.country} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="postal_code">Postal Code</label>
            <input 
              type="text" 
              id="postal_code"
              name="postal_code" 
              className="form-control" 
              value={formData.postal_code} 
              onChange={handleChange} 
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Additional Notes</h3>
        <div className="form-group">
          <label className="sr-only" htmlFor="notes" style={{display: 'none'}}>Notes</label>
          <textarea 
            id="notes"
            name="notes" 
            className="form-control" 
            rows="3" 
            value={formData.notes} 
            onChange={handleChange}
            placeholder="Add any additional context or notes about this contact..."
          ></textarea>
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={() => navigate('/')}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="spinner" style={{width: '1rem', height: '1rem', borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white'}}></div>
              Saving...
            </>
          ) : (
            'Save Contact'
          )}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
