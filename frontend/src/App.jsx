import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ContactsPage from './pages/ContactsPage';
import AddContactPage from './pages/AddContactPage';
import EditContactPage from './pages/EditContactPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="navbar">
          <div className="navbar-brand">
            <Link to="/">Address Book</Link>
          </div>
          <nav className="navbar-links">
            <Link to="/">Contacts</Link>
            <Link to="/add" className="btn btn-primary">Add Contact</Link>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ContactsPage />} />
            <Route path="/add" element={<AddContactPage />} />
            <Route path="/edit/:id" element={<EditContactPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
