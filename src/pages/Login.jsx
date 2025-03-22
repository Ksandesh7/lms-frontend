import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {email, password} = formData;

        if(!email || !password) {
            setError("Email and password are required!");
            return ;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method:'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({email, password})
            })

            if(!response.ok) {
                throw new Error('Invalid Credentials!');
            }

            const data = await response.json();
            console.log("Login Successful: ", data);

            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('role', data.role);    
            setSuccess("Login successful! Redirecting...");

            setTimeout(()=>navigate('/'), 1500);
        }
        catch(err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <Header />

            <div className="login-container">
                <div className="login-box">
                    <h2>Login</h2>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="text"
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
                                placeholder="Enter your password"
                            />
                        </div>
                        <button type="submit" className="login-button">Login</button>
                    </form>
                    <p className="register-text">
                        New here?{" "}
                        <span className="register-link" onClick={() => navigate("/register")}>
                            Register
                        </span>
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Login;
