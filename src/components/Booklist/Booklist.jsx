// import { useState } from "react";
// import "./BookList.css"; // Import the CSS file

// const BookList = () => {
//   const [books, setBooks] = useState([
//     { id: 1, name: "Hibernate Core ~11th", author: "John Doe", price: 499, quantity: 5 },
//     { id: 2, name: "React Essentials", author: "Jane Smith", price: 799, quantity: 2 },
//     { id: 3, name: "Node.js Mastery", author: "Alex Johnson", price: 599, quantity: 0 },
//   ]);

//   const borrowBook = (id) => {
//     setBooks((prevBooks) =>
//       prevBooks.map((book) =>
//         book.id === id && book.quantity > 0
//           ? { ...book, quantity: book.quantity - 1 }
//           : book
//       )
//     );
//   };

//   return (
//     <div className="book-container">
//       <h2 className="book-title">Book Store Inventory</h2>
//       <table className="book-table">
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Name</th>
//             <th>Author</th>
//             <th>Price (₹)</th>
//             <th>Quantity</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {books.map((book) => (
//             <tr key={book.id}>
//               <td>{book.id}</td>
//               <td>{book.name}</td>
//               <td>{book.author}</td>
//               <td>₹{book.price}</td>
//               <td>{book.quantity}</td>
//               <td>
//                 <button
//                   onClick={() => borrowBook(book.id)}
//                   disabled={book.quantity === 0}
//                   className={`borrow-button ${book.quantity === 0 ? "disabled" : ""}`}
//                 >
//                   Borrow
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default BookList;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookList.css";

const BookList = () => {
  const navigate = useNavigate();
  // const [books] = useState([
  //   { id: 1, name: "Hibernate Core ~11th", author: "John Doe", price: 499, quantity: 5 },
  //   { id: 2, name: "React Essentials", author: "Jane Smith", price: 799, quantity: 2 },
  //   { id: 3, name: "Node.js Mastery", author: "Alex Johnson", price: 599, quantity: 0 },
  // ]);

  const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const token = localStorage.getItem("token"); // Retrieve token from localStorage
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/books`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setBooks(response.data);
            } catch (err) {
                setError("Failed to load books");
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

  const handleBorrow = (id) => {
    navigate(`/borrow/${id}`);
  };

  return (
    <div className="book-container">
      <h2 className="book-title">Book Store Inventory</h2>
      <table className="book-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Author</th>
            {/* <th>Price (₹)</th> */}
            <th>Quantity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              {/* <td>₹{book.price}</td> */}
              <td>{book.quantity}</td>
              <td>
                <button
                  onClick={() => handleBorrow(book.id)}
                  disabled={book.quantity === 0}
                  className={`borrow-button ${book.quantity === 0 ? "disabled" : ""}`}
                >
                  Borrow
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookList;
