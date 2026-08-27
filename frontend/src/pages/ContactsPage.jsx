import React, { useState, useEffect } from 'react';
import { contactService } from '../services/api';
import ContactCard from '../components/ContactCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Search state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Delete modal state
  const [contactToDelete, setContactToDelete] = useState(null);

  const fetchContacts = async (currentPage, currentSearch) => {
    setLoading(true);
    setError('');
    try {
      const response = await contactService.getContacts(currentPage, 20, currentSearch);
      setContacts(response.data.contacts);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to load contacts. Please try again later.');
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
  };

  const handleDeleteClick = (contact) => {
    setContactToDelete(contact);
  };

  const handleConfirmDelete = async (id) => {
    try {
      await contactService.deleteContact(id);
      setContactToDelete(null);
      // Refresh list
      fetchContacts(page, search);
    } catch (err) {
      setError('Failed to delete contact.');
      setContactToDelete(null);
    }
  };

  return (
    <div>
      <div className="contacts-header">
        <h1>Contacts</h1>
        <SearchBar onSearch={handleSearch} initialQuery={search} />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading contacts...</div>
      ) : (
        <>
          {contacts.length === 0 ? (
            <div className="text-center mt-2">
              <p>No contacts found.</p>
            </div>
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
