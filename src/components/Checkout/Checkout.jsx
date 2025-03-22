import React, { useContext } from "react";
import "./Checkout.css";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const Checkout = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const totalItems = cart.reduce((sum, book) => sum + book.quantity, 0);
  // const totalPrice = cart.reduce(
  //   (sum, book) => sum + book.quantity * book.price,
  //   0
  // );

  const handleCheckout = async() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if(!token || !userId) {
      toast.error("User not authenticated");
      return ;
    }

    try {
      for(const book of cart) {
        const {data} = await axios.get(
          `${import.meta.env.VITE_API_URL}/books/${book.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if(book.quantity > data.quantity) {
          toast.error(`Quantity exceeds for ${book.title}`);
          return ;
        }
        else {
          console.log(`For Book ${book.title}, quantity is under limits`);
        }
      }

      for(const book of cart) {
        for(let i=0; i<book.quantity; i++) {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/loans`,
            {
              userId, 
              bookId: book.id,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
        toast.success(`Successfully checked out "${book.title}"`);
      }

      clearCart();

      navigate("/checkout-success");
    }
    catch(err) {
      console.error("Checkout failed", error);
      toast.error("Checkout failed. Please try again.");
    }
  }

  return (
    <div className="checkout-container">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cart.map((book) => (
          <div key={book.id} className="cart-item">
            <img src={book.imageUrl} alt={book.title} className="cart-image" />
            <div className="cart-info">
              <h3 className="cart-title">{book.title}</h3>
              <p className="cart-author">{book.author}</p>
              {/* <p className="cart-price">${book.price.toFixed(2)}</p> */}
              
              {/* Quantity Selector */}
              {/* <div className="quantity-selector">
                <button
                  onClick={() => updateQuantity(book.id, book.quantity - 1)}
                  disabled={book.quantity <= 1}
                >
                  -
                </button>
                <span>{book.quantity}</span>
                <button
                  onClick={() => updateQuantity(book.id, book.quantity + 1)}
                >
                  +
                </button>
              </div> */}

              {/* Remove Button */}
              <button
                className="remove-btn"
                onClick={() => removeFromCart(book.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total Section */}
      <div className="checkout-summary">
        <p>Total Items: <strong>{totalItems}</strong></p>
        {/* <p>Total Price: <strong>${totalPrice.toFixed(2)}</strong></p> */}
        <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
      </div>

      <ToastContainer />  
    </div>
  );
};

export default Checkout;
