import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contactService } from '../services/api';
import ContactCard from '../components/ContactCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Pagination & Search state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Delete modal state
  const [contactToDelete, setContactToDelete] = useState(null);

  const getFriendlyErrorMessage = (err) => {
    if (!err.response) return 'Unable to connect to the server. Please check your internet connection.';
    const status = err.response.status;
    if (status === 403) return 'This operation requires elevated database permissions that are currently unavailable.';
    if (status === 404) return 'Contact not found.';
    if (status === 409) return 'A contact with this email or phone number already exists.';
    if (status >= 500) return 'Something went wrong on our end. Please try again later.';
    return err.response.data?.error || 'An unexpected error occurred.';
  };

  const fetchContacts = async (currentPage, currentSearch) => {
    setLoading(true);
    setError('');
    try {
      const response = await contactService.getContacts(currentPage, 20, currentSearch);
      setContacts(response.data.contacts);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(page, search);
  }, [page, search]);

  const handleSearch = (query) => {
    setSearch(query);
    setPage(1); // reset to page 1 on new search
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (contact) => {
    setContactToDelete(contact);
    setError('');
    setSuccessMsg('');
  };

  const handleConfirmDelete = async (id) => {
    try {
      await contactService.deleteContact(id);
      setContactToDelete(null);
      setSuccessMsg('Contact deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchContacts(page, search);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
      setContactToDelete(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Contacts</h1>
          <p className="page-subtitle">Manage your contacts and organizations</p>
        </div>
        <SearchBar onSearch={handleSearch} initialQuery={search} />
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

      {successMsg && (
        <div className="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          Loading contacts...
        </div>
      ) : (
        <>
          {contacts.length === 0 ? (
            search ? (
              <div className="empty-state">
                <svg className="empty-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3 className="empty-title">No matching contacts</h3>
                <p className="empty-desc">We couldn't find any contacts matching "{search}".</p>
                <button className="btn btn-secondary" onClick={() => handleSearch('')}>Clear Search</button>
              </div>
            ) : (
              <div className="empty-state">
                <svg className="empty-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h3 className="empty-title">No contacts yet</h3>
                <p className="empty-desc">Start building your address book by adding your first contact.</p>
                <Link to="/add" className="btn btn-primary" style={{marginTop: '1rem'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Contact
                </Link>
              </div>
            )
          ) : (
            <>
              <div className="contact-grid">
                {contacts.map(contact => (
                  <ContactCard 
                    key={contact.id} 
                    contact={contact} 
                    onDeleteClick={handleDeleteClick} 
                  />
                ))}
              </div>
              
              <Pagination 
                page={page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </>
          )}
        </>
      )}

      {contactToDelete && (
        <DeleteConfirmationModal 
          contact={contactToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setContactToDelete(null)}
        />
      )}
    </div>
  );
};

export default ContactsPage;
