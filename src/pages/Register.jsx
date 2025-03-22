import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./Register.css";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "PATRON", // Set default role as PATRON
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const {firstName, lastName, email, password, role} = formData;

        if(!firstName || !lastName || !email || !password) {
          setError("All fields are required!");
          return ;
        }

        if(password.length < 6) {
          setError("Password must be atleast 6 characters long!");
        }

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firstName,
              lastName,
              email,
              password,
              role //Sending default role as PATRON
            })
          });

          if(!response.ok) {
            throw new Error('Failed to register');
          }

          setError("");
          setSuccess('Registration successful! Redirecting to login...');
          setTimeout(()=>navigate('/login'), 1500);
        }
        catch(error) {
          setError(error.message);
        }
    };

    return (
        <div>
            <Header />

            <div className="register-container">
                <div className="register-box">
                    <h2>Register</h2>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter your last name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter a password"
                            />
                        </div>
                        <button type="submit" className="register-button">
                            Register
                        </button>
                    </form>
                    <p className="login-text">
                        Already have an account?{" "}
                        <span
                            className="login-link"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Register;
