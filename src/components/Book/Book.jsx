import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./Book.css";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Modal from "./Modal";    

const DEFAULT_IMAGE = "../../../public/default-book.png";

const Book = () => {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const { addToCart, cart } = useContext(CartContext);
    const [selectedBook, setSelectedBook] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState("");
    const [sortBy, setSortBy] = useState("title,asc");

    // Initial data fetch - we need this to extract genres
    useEffect(() => {
        const fetchInitialData = async () => {
            setInitialLoading(true);
            try {
                const token = localStorage.getItem("token");
                // Fetch a larger initial set to extract genres
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/books?page=0&size=50`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const booksWithRatings = response.data.content.map((book) => ({
                    ...book,
                    rating: (Math.random() * 2 + 3).toFixed(1),
                }));

                setBooks(booksWithRatings);
                setPage(1);
                setTotalPages(response.data.totalPages);
                
                // Extract unique genres
                const uniqueGenres = [...new Set(booksWithRatings.map(book => book.genre))].sort();
                setGenres(uniqueGenres);
            } catch (error) {
                console.error("Failed to load initial data", error);
                toast.error("Failed to load books. Please try again.");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Refetch books when search or filter changes
    useEffect(() => {
        if (initialLoading) return;
        
        // Skip if this is the initial load
        const applyFilters = async () => {
            setLoading(true);
            
            try {
                const token = localStorage.getItem("token");
                
                // Build URL with query parameters
                let url = `${import.meta.env.VITE_API_URL}/books?page=0&size=10&sort=${sortBy}`;
                if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
                if (selectedGenre) url += `&genre=${encodeURIComponent(selectedGenre)}`;
                
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Add random ratings between 3.0 and 5.0
                const booksWithRatings = response.data.content.map((book) => ({
                    ...book,
                    rating: (Math.random() * 2 + 3).toFixed(1),
                }));

                setBooks(booksWithRatings);
                setPage(1);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error("Failed to apply filters", error);
                toast.error("Failed to filter books. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        // Debounce the search to avoid too many requests
        const timeoutId = setTimeout(() => {
            applyFilters();
        }, 500);
        
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedGenre, sortBy, initialLoading]);

    const fetchMoreBooks = async () => {
        if (loading || page >= totalPages) return;
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            
            // Build URL with query parameters
            let url = `${import.meta.env.VITE_API_URL}/books?page=${page}&size=10&sort=${sortBy}`;
            if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
            if (selectedGenre) url += `&genre=${encodeURIComponent(selectedGenre)}`;
            // if (maxPrice) url += `&maxPrice=${maxPrice}`;
            
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Add random ratings between 3.0 and 5.0
            const booksWithRatings = response.data.content.map((book) => ({
                ...book,
                rating: (Math.random() * 2 + 3).toFixed(1),
            }));

            setBooks((prevBooks) => [...prevBooks, ...booksWithRatings]);
            setPage(page + 1);
        } catch (error) {
            console.error("Failed to load more books", error);
            toast.error("Failed to load more books. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageError = (event) => {
        event.target.src = DEFAULT_IMAGE;
    };

    const handleAddToCart = async(book) => {
        const isAlreadyInCart = cart.some((item)=>item.id===book.id);
        if(isAlreadyInCart) {
            toast.info(`You already have "${book.title}" in your cart`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            });
            return ;
        }
        try {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");

            const {data} = await axios.get(`${import.meta.env.VITE_API_URL}/loans/check/${userId}/${book.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if(data.hasActiveLoan) {
                toast.warning(`You have already borrowed "${book.title}". Please return it first.`, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                })
                return ;
            }

            addToCart(book);
            // addToCart(book);
            toast.success(`"${book.title}" added to cart!`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            });       
        }
        catch(err) {
            console.error("Error checking loan status", error);
            toast.error(`Failed to verify availability for "${book.title}". Please try again.`);
        }
    };

    const handleOpenModal = async (bookId) => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/books/${bookId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSelectedBook(data);
            setShowModal(true);
        } catch (error) {
            console.error("Failed to fetch book details", error);
            toast.error("Failed to load book details");
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleGenreChange = (e) => {
        setSelectedGenre(e.target.value);
    };

    // const handleMaxPriceChange = (e) => {
    //     setMaxPrice(e.target.value);
    // };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedGenre("");
        // setMaxPrice("");
        setSortBy("title,asc");
    };

    const hasActiveFilters = searchTerm || selectedGenre || sortBy !== "title,asc";

    if (initialLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading books...</p>
            </div>
        );
    }

    return (
        <div className="books-container">
            {/* Search and Filter Section */}
            <div className="search-filter-container">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <div className="filter-box">
                    <select 
                        value={selectedGenre} 
                        onChange={handleGenreChange}
                        className="filter-select"
                    >
                        <option value="">All Genres</option>
                        {genres.map((genre, index) => (
                            <option key={index} value={genre}>
                                {genre}
                            </option>
                        ))}
                    </select>
                    
                    {/* <input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                        className="price-input"
                        min="0"
                        step="0.01"
                    /> */}
                    
                    <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className="filter-select"
                    >
                        <option value="title,asc">Title (A-Z)</option>
                        <option value="title,desc">Title (Z-A)</option>
                        <option value="author,asc">Author (A-Z)</option>
                        <option value="author,desc">Author (Z-A)</option>
                        {/* <option value="price,asc">Price (Low to High)</option> */}
                        {/* <option value="price,desc">Price (High to Low)</option> */}
                    </select>
                    
                    {hasActiveFilters && (
                        <button 
                            onClick={handleClearFilters}
                            className="clear-filters-btn"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Books Grid */}
            <div className="books-grid">
                {loading && books.length === 0 ? (
                    <div className="loading-message">Loading books...</div>
                ) : books.length > 0 ? (
                    books.map((book) => (
                        <div key={book.id} className="book-card" onClick={() => handleOpenModal(book.id)}>
                            <img
                                src={book.imageUrl}
                                alt={book.title}
                                className="book-image"
                                onError={handleImageError}
                            />
                            <div className="book-info">
                                <h3 className="book-title">{book.title}</h3>
                                <p className="book-author">by {book.author}</p>
                                <p className="book-genre">{book.genre}</p>
                                <div className="book-rating">
                                    ⭐⭐⭐⭐⭐ ({book.rating})
                                </div>
                                <p
                                    className={`book-status ${
                                        book.status === "AVAILABLE"
                                            ? "available"
                                            : "unavailable"
                                    }`}
                                >
                                    {book.status}
                                </p>
                                <button
                                    className="add-to-cart-btn"
                                    onClick={(e) => {e.stopPropagation(); handleAddToCart(book)}}
                                    disabled={book.status !== "AVAILABLE"}
                                >
                                    {book.status === "AVAILABLE"
                                        ? "Add to Cart"
                                        : "Out of Stock"}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <p>No books found matching your search criteria.</p>
                        <button onClick={handleClearFilters} className="clear-filters-btn">
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Show More Button */}
            {page < totalPages && books.length > 0 && (
                <button
                    onClick={fetchMoreBooks}
                    className="show-more-btn"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Show More Books"}
                </button>
            )}

            {/* Checkout Button */}
            {cart.length > 0 && (
                <button
                    onClick={() => navigate("/checkout")}
                    className="checkout-btn"
                >
                    Checkout ({cart.length} items)
                </button>
            )}

            {/* Show Modal */}
            {showModal && (
                <Modal book={selectedBook} onClose={() => setShowModal(false)} />
            )}

            <ToastContainer />
        </div>
    );
};

export default Book;