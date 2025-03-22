import React from "react";
import "./Modal.css";

const DEFAULT_IMAGE = "../../../public/default-book.png";

const Modal = ({ book, onClose }) => {
  if (!book) return null;

  const handleImageError = (event) => {
    event.target.src = DEFAULT_IMAGE;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <img
          src={book.imageUrl}
          alt={book.title}
          className="modal-image"
          onError={handleImageError}
        />
        <div className="modal-details">
          <h3>{book.title}</h3>
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>Genre:</strong> {book.genre}</p>
          {/* <p><strong>Price:</strong> ${book.price.toFixed(2)}</p> */}
          <p><strong>Status:</strong> {book.status}</p>
          <p><strong>Quantity:</strong> {book.quantity}</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
