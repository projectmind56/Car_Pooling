import React, { useState, useEffect } from 'react';

function PassengerForm({ index, passenger, onChange }) {
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
  });

  // Validate all fields whenever passenger changes
  useEffect(() => {
    const newErrors = {};

    // Name required
    if (!passenger.name || passenger.name.trim() === '') {
      newErrors.name = 'Name is required';
    }

    // Email required and format check
    if (!passenger.email || passenger.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone required and 10 digits
    if (!passenger.phone || passenger.phone.trim() === '') {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(passenger.phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }

    // Age required and range check
    if (passenger.age === '' || passenger.age === null) {
      newErrors.age = 'Age is required';
    } else {
      const age = parseInt(passenger.age);
      if (isNaN(age) || age < 5 || age > 100) {
        newErrors.age = 'Age must be between 5 and 100';
      }
    }

    setErrors(newErrors);
  }, [passenger]);

  return (
    <div className="border p-3 rounded mb-3">
      <h6>Person {index + 1}</h6>
      <div className="row g-2">
        {/* Name */}
        <div className="col-md-6">
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            placeholder="Name"
            value={passenger.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name}</div>
          )}
        </div>

        {/* Email */}
        <div className="col-md-6">
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="Email"
            value={passenger.email}
            onChange={(e) => onChange(index, 'email', e.target.value)}
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>

        {/* Phone */}
        <div className="col-md-6">
          <input
            type="tel"
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            placeholder="Phone"
            value={passenger.phone}
            onChange={(e) => onChange(index, 'phone', e.target.value)}
          />
          {errors.phone && (
            <div className="invalid-feedback">{errors.phone}</div>
          )}
        </div>

        {/* Age */}
        <div className="col-md-6">
          <input
            type="number"
            className={`form-control ${errors.age ? 'is-invalid' : ''}`}
            placeholder="Age"
            value={passenger.age}
            onChange={(e) => onChange(index, 'age', e.target.value)}
          />
          {errors.age && (
            <div className="invalid-feedback">{errors.age}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PassengerForm;
