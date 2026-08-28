import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import ContactsPage from './pages/ContactsPage';
import AddContactPage from './pages/AddContactPage';
import EditContactPage from './pages/EditContactPage';
import AgentPage from './pages/AgentPage';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <Router>
      <div className="app-container">
        <header className="navbar">
          <div className="navbar-brand">
            <Link to="/" onClick={closeMenu}>
              <span style={{ fontSize: '1.25rem', marginRight: '0.25rem' }}>📖</span> Address Book
            </Link>
          </div>
          
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <nav className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              onClick={closeMenu}
            >
              Contacts
            </NavLink>
            <NavLink 
              to="/agent" 
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              onClick={closeMenu}
            >
              Agent
            </NavLink>
            <Link 
              to="/add" 
              className="btn btn-primary"
              onClick={closeMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Contact
            </Link>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ContactsPage />} />
            <Route path="/agent" element={<AgentPage />} />
            <Route path="/add" element={<AddContactPage />} />
            <Route path="/edit/:id" element={<EditContactPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
