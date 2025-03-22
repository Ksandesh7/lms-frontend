import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [fines, setFines] = useState([]);
  const [bookTitles, setBookTitles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        // Get user info from token
        const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);

        // Fetch user's loans
        const loansResponse = await axios.get(`${import.meta.env.VITE_API_URL}/loans/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userLoans = loansResponse.data;
        setLoans(userLoans);

        // Fetch all book titles for the loans
        const titles = {};
        for (const loan of userLoans) {
          try {
            const bookResponse = await axios.get(`${import.meta.env.VITE_API_URL}/books/${loan.bookId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            titles[loan.bookId] = bookResponse.data.title;
          } catch (bookErr) {
            console.error(`Error fetching book details for ID ${loan.bookId}:`, bookErr);
            titles[loan.bookId] = 'Unknown Book';
          }
        }
        setBookTitles(titles);

        // For each loan, fetch the associated fine
        const allFines = [];
        for (const loan of userLoans) {
          try {
            const fineResponse = await axios.get(`${import.meta.env.VITE_API_URL}/fines/${loan.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (fineResponse.data) {
              // Add the loan information to the fine object for display purposes
              const fineWithLoan = { 
                ...fineResponse.data, 
                loanInfo: loan 
              };
              allFines.push(fineWithLoan);
            }
          } catch (fineErr) {
            // If no fine exists for this loan, just continue
            console.log(`No fine found for loan ${loan.id} or error fetching:`, fineErr);
          }
        }
        setFines(allFines);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculate due date status
  const getDueDate = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isOverdue = due < now;
    const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (isOverdue) {
      return (
        <span className="due-date overdue">
          <span className="clock-icon"></span>
          {formatDate(dueDate)} ({Math.abs(daysLeft)} days overdue)
        </span>
      );
    }
    
    return (
      <span className="due-date">
        <span className="clock-icon"></span>
        {formatDate(dueDate)} ({daysLeft} days left)
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon"></div>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate total unpaid fines
  const totalUnpaidFines = fines
    .filter(fine => fine.status === 'UNPAID')
    .reduce((total, fine) => total + fine.amount, 0)
    .toFixed(2);

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="header-content">
          <div className="header-text">
            <h1>My Profile</h1>
            <p>Manage your books and account information</p>
          </div>
          <div className="header-actions">
            <button className="btn-dashboard" onClick={() => navigate('/')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="profile-content">
        {/* User Info Card */}
        <div className="user-card">
          <div className="user-info">
            <div className="user-avatar-section">
              <div className="user-avatar">
                <span className="user-icon"></span>
              </div>
              <h2>{user.firstName} {user.lastName}</h2>
              <div className="user-email">
                <span className="email-icon"></span>
                <span>{user.email}</span>
              </div>
            </div>
            <div className="user-details">
              <div className="user-stats">
                <div className="stat-group">
                  <h3>Account Summary</h3>
                  <div className="stat-item">
                    <span className="stat-label">Member Since</span>
                    <span className="stat-value">January 2024</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Role</span>
                    <span className="stat-value capitalize">{user.role || 'Member'}</span>
                  </div>
                </div>
                <div className="stat-group">
                  <h3>Current Activity</h3>
                  <div className="stat-item">
                    <span className="stat-label">Books Borrowed</span>
                    <span className="stat-value">{loans.filter(loan => loan.status === 'ACTIVE').length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Outstanding Fines</span>
                    <span className="stat-value fine-amount">${totalUnpaidFines}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Container */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button 
              className={`tab-button ${activeTab === 'books' ? 'active' : ''}`} 
              onClick={() => setActiveTab('books')}
            >
              <span className="bookmark-icon"></span>
              Borrowed Books
            </button>
            <button 
              className={`tab-button ${activeTab === 'fines' ? 'active' : ''}`} 
              onClick={() => setActiveTab('fines')}
            >
              <span className="payment-icon"></span>
              Fines
            </button>
          </div>

          {/* Borrowed Books Tab */}
          <div className={`tab-content ${activeTab === 'books' ? 'active' : ''}`}>
            {loans.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Checkout Date</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.map((loan) => (
                      <tr key={loan.id}>
                        <td>
                          <div className="book-info">
                            <div className="book-icon">
                              <span className="bookmark-icon"></span>
                            </div>
                            <div className="book-details">
                              <div className="book-title">{bookTitles[loan.bookId] || 'Loading...'}</div>
                              <div className="book-id">ID: {loan.bookId}</div>
                            </div>
                          </div>
                        </td>
                        <td>{formatDate(loan.checkoutDate)}</td>
                        <td>{getDueDate(loan.dueDate)}</td>
                        <td>
                          <span className={`status-badge ${loan.status.toLowerCase()}`}>
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon bookmark-icon-large"></div>
                <h3>No books</h3>
                <p>You haven't borrowed any books yet.</p>
                <button className="btn-primary" onClick={() => navigate('/catalog')}>
                  <span className="bookmark-icon"></span>
                  Browse Catalog
                </button>
              </div>
            )}
          </div>

          {/* Fines Tab */}
          <div className={`tab-content ${activeTab === 'fines' ? 'active' : ''}`}>
            {fines.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map((fine) => (
                      <tr key={fine.id}>
                        <td>
                          <div className="book-info">
                            <div className="fine-icon">
                              <span className="alert-icon"></span>
                            </div>
                            <div className="book-details">
                              <div className="book-title">{bookTitles[fine.loanInfo.bookId] || 'Loading...'}</div>
                              <div className="book-id">Loan ID: {fine.loanInfo.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="fine-amount">${fine.amount.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${fine.status.toLowerCase()}`}>
                            {fine.status}
                          </span>
                        </td>
                        <td className="text-right">
                          {fine.status === 'UNPAID' ? (
                            <button
                              className="btn-pay"
                              onClick={() => navigate(`/payment/${fine.loanInfo.id}`)}
                            >
                              Pay Now
                            </button>
                          ) : (
                            <span className="payment-status">
                              <span className="check-icon"></span>
                              Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon check-icon-large"></div>
                <h3>No fines</h3>
                <p>You don't have any outstanding fines.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;