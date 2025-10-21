import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (formData.password.length < 7) {
      newErrors.password = 'Password must be more than 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const { confirmPassword, ...submitData } = formData;

    try {
      const response = await fetch('http://localhost:5218/api/User/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        toast.success('Registration successful!');
        setFormData({
          userName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
        });
      } else {
        const data = await response.json();
        toast.error('Registration failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during registration.');
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex p-0">
      <div className="d-flex flex-column justify-content-center align-items-center col-md-6 text-white bg-primary p-5">
        <h1 className="mb-3">Welcome to Carpool Connect</h1>
        <p className="text-light text-center px-4" style={{ fontSize: '0.9rem' }}>
          Join our platform to share rides, save money, and reduce your carbon footprint. Safe. Simple. Smart.
        </p>
      </div>

      <div className="d-flex flex-column justify-content-center align-items-center col-md-6 bg-light p-4">
        <div className="card shadow-sm p-4" style={{ width: '100%', maxWidth: '600px', fontSize: '0.9rem' }}>
          <h4 className="text-center mb-4">Create Account</h4>

          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="userName"
                className="form-control"
                value={formData.userName}
                onChange={handleChange}
              />
              {errors.userName && <div className="text-danger small">{errors.userName}</div>}
            </div>

            <div className="mb-2">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <div className="text-danger small">{errors.email}</div>}
            </div>

            <div className="mb-2">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <div className="text-danger small">{errors.phone}</div>}
            </div>

            <div className="mb-2">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <div className="text-danger small">{errors.password}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <div className="text-danger small">{errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="btn btn-primary w-100 mb-2">
              Register
            </button>

            <div className="text-center mt-2">
              <small>
                Already have an account?{' '}
                <Link to="/login" className="text-decoration-none">
                  Login here
                </Link>
              </small>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default Register;
