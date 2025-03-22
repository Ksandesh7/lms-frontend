import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Payment.css';

const Payment = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  
  const [fineId, setFineId] = useState('');
  const [fine, setFine] = useState(null);
  const [loan, setLoan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchFineAndLoanDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        // Fetch fine details
        const fineResponse = await axios.get(`${import.meta.env.VITE_API_URL}/fines/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFine(fineResponse.data);
        setFineId(fineResponse.data.id);
        
        // Fetch loan details to check if it's still active
        const loanResponse = await axios.get(`${import.meta.env.VITE_API_URL}/loans/${loanId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLoan(loanResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError('Failed to load payment information. Please try again.');
        setLoading(false);
      }
    };
    
    fetchFineAndLoanDetails();
  }, [loanId, navigate]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    const token = localStorage.getItem('token');
    console.log("1. token : ", token);
    
    try {
      // Step 1: Process the payment
      const paymentData = {
        fineId: fineId,
        amount: fine.amount,
        paymentMethod: paymentMethod
      };

        console.log("2. paymentData : ", paymentData);

      
      await axios.post(`${import.meta.env.VITE_API_URL}/fines/pay`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

    console.log("3. fine paid successfully : ");
    console.log("4. loan status : ", loan.status);


      
      // Step 2: If loan is still active, return the book
      if (loan && loan.status === 'ACTIVE') {
        await axios.put(`${import.meta.env.VITE_API_URL}/loans/return/${loanId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    console.log("5. Book returned successfully : ");

      
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again or contact support.');
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="payment-loading">Loading payment details...</div>;
  }
  
  if (error) {
    return <div className="payment-error">{error}</div>;
  }
  
  if (success) {
    return (
      <div className="payment-success">
        <h2>Payment Successful!</h2>
        <p>Your payment has been processed successfully.</p>
        {loan && loan.status === 'ACTIVE' && (
          <p>The book has been marked as returned.</p>
        )}
        <p>Redirecting to your profile...</p>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h1>Pay Fine</h1>
      
      <div className="payment-details">
        <div className="fine-details">
          <h2>Fine Details</h2>
          <div className="detail-item">
            <span className="detail-label">Fine ID:</span>
            <span className="detail-value">{fineId}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Amount:</span>
            <span className="detail-value">${fine.amount}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className="detail-value">{fine.status}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Associated Loan:</span>
            <span className="detail-value">{loanId}</span>
          </div>
          {loan && (
            <div className="detail-item">
              <span className="detail-label">Loan Status:</span>
              <span className="detail-value">{loan.status}</span>
            </div>
          )}
          {loan && loan.status === 'ACTIVE' && (
            <div className="note-container">
              <p className="note">Note: The book will be automatically marked as returned upon payment.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="payment-form-container">
        <form className="payment-form" onSubmit={handleSubmitPayment}>
          <h2>Payment Method</h2>
          
          <div className="payment-methods">
            <div className="payment-method">
              <input
                type="radio"
                id="credit-card"
                name="paymentMethod"
                value="CREDIT_CARD"
                checked={paymentMethod === 'CREDIT_CARD'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="credit-card">Credit Card</label>
            </div>
            
            <div className="payment-method">
              <input
                type="radio"
                id="debit-card"
                name="paymentMethod"
                value="DEBIT_CARD"
                checked={paymentMethod === 'DEBIT_CARD'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="debit-card">Debit Card</label>
            </div>
            
            <div className="payment-method">
              <input
                type="radio"
                id="paypal"
                name="paymentMethod"
                value="PAYPAL"
                checked={paymentMethod === 'PAYPAL'}
                onChange={handlePaymentMethodChange}
              />
              <label htmlFor="paypal">PayPal</label>
            </div>
          </div>
          
          {paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD' ? (
            <div className="card-details">
              <div className="form-group">
                <label htmlFor="card-number">Card Number</label>
                <input 
                  type="text" 
                  id="card-number" 
                  placeholder="1234 5678 9012 3456" 
                  maxLength="19"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiry-date">Expiry Date</label>
                  <input 
                    type="text" 
                    id="expiry-date" 
                    placeholder="MM/YY" 
                    maxLength="5"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input 
                    type="text" 
                    id="cvv" 
                    placeholder="123" 
                    maxLength="3"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="cardholder-name">Cardholder Name</label>
                <input 
                  type="text" 
                  id="cardholder-name" 
                  placeholder="John Doe" 
                  required
                />
              </div>
            </div>
          ) : paymentMethod === 'PAYPAL' && (
            <div className="paypal-info">
              <p>You will be redirected to PayPal to complete your payment.</p>
            </div>
          )}
          
          <div className="payment-summary">
            <div className="summary-item">
              <span className="summary-label">Fine Amount:</span>
              <span className="summary-value">${fine.amount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Processing Fee:</span>
              <span className="summary-value">$0.00</span>
            </div>
            <div className="summary-item total">
              <span className="summary-label">Total:</span>
              <span className="summary-value">${fine.amount}</span>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/profile')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="pay-button"
              disabled={processing}
            >
              {processing ? 'Processing...' : `Pay $${fine.amount}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment;