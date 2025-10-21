import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5218/api/User/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('id',data.userId)
        toast.success('Login successful!');
        setTimeout(() => {
            navigate('/layout');
        }, 3000);
        // TODO: redirect if needed
      } else {
        const errorData = await response.json();
        toast.error('Login failed: ' + (errorData.message || 'Invalid credentials'));
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during login.');
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex p-0">
      {/* Left panel: Login Form */}
      <div className="d-flex flex-column justify-content-center align-items-center col-md-6 bg-light p-4">
        <div className="card shadow-sm p-4 w-100" style={{ maxWidth: '500px', fontSize: '0.9rem' }}>
          <h4 className="text-center mb-4">Login to Your Account</h4>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>

            <div className="text-center mt-3">
              <small>
                Don't have an account?{' '}
                <Link to="/register" className="text-decoration-none">
                  Register here
                </Link>
              </small>
            </div>
          </form>
        </div>
      </div>

      {/* Right panel: Info */}
      <div className="d-flex flex-column justify-content-center align-items-center col-md-6 text-white bg-primary p-5">
        <h1 className="mb-3">Welcome Back!</h1>
        <p className="text-light text-center px-4" style={{ fontSize: '0.9rem' }}>
          Log in to access carpool routes, schedule your rides, and connect with your travel community.
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default Login;