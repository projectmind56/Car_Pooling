import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateDrive() {
    const [formData, setFormData] = useState({
        usreId: localStorage.getItem('id') || 0,
        from: '',
        to: '',
        stops: [],
        date: '',
        time: '',
        vehicleNumber: '',
        carModel: '',
        capacity: '',
        licenseNumber: '',
        carPhotos: [],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStopChange = (index, value) => {
        const updatedStops = [...formData.stops];
        updatedStops[index] = value;
        setFormData(prev => ({ ...prev, stops: updatedStops }));
    };

    const addStop = () => {
        const stops = formData.stops;
        if (stops.length === 0 || stops[stops.length - 1].trim() !== '') {
            setFormData(prev => ({ ...prev, stops: [...prev.stops, ''] }));
        } else {
            toast.warning('Please fill the last stop before adding a new one.');
        }
    };

    const removeStop = (index) => {
        const updatedStops = [...formData.stops];
        updatedStops.splice(index, 1);
        setFormData(prev => ({ ...prev, stops: updatedStops }));
    };

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);

        // Remove duplicates by comparing file names
        const existingNames = new Set(formData.carPhotos.map(file => file.name));
        const newFiles = selected.filter(file => !existingNames.has(file.name));

        const combined = [...formData.carPhotos, ...newFiles];

        if (combined.length > 5) {
            toast.error('You can only upload up to 5 unique photos.');
            return;
        }

        setFormData(prev => ({ ...prev, carPhotos: combined }));
    };

    const validateVehicleNumber = (number) => {
        return /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(number.toUpperCase());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate user ID
        if (formData.usreId === 0) {
            toast.error('Please log in before creating a drive.');
            return;
        }

        // Validate vehicle number format
        if (!validateVehicleNumber(formData.vehicleNumber)) {
            toast.error('Invalid vehicle number format (e.g., TN39KS3333)');
            return;
        }

        // Validate date & time (must be 6+ hours ahead in IST)
        const driveDateTime = new Date(`${formData.date}T${formData.time}`);
        const now = new Date();
        const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const minAllowedTime = new Date(nowIST.getTime() + 6 * 60 * 60 * 1000);

        if (driveDateTime < minAllowedTime) {
            toast.error('Drive time must be at least 6 hours from now (IST).');
            return;
        }

        // Validate car photo count
        if (formData.carPhotos.length < 5) {
            toast.error('Please upload at least 5 unique car photos.');
            return;
        }

        if (formData.capacity > 8) {
            toast.error('Please enter the capacity below 8');
            return;
        }

        try {
            const form = new FormData();
            form.append('userId', formData.usreId);
            form.append('from', formData.from);
            form.append('to', formData.to);
            form.append('dateTime', `${formData.date}T${formData.time}`);
            form.append('vehicleNumber', formData.vehicleNumber);
            form.append('carModel', formData.carModel);
            form.append('capacity', formData.capacity);
            form.append('licenseNumber', formData.licenseNumber);

            formData.stops.forEach((stop, index) => {
                form.append(`stops[${index}]`, stop);
            });

            formData.carPhotos.forEach((file) => {
                form.append('carPhotos', file);
            });

            const response = await fetch('http://localhost:5218/api/Drive/create', {
                method: 'POST',
                body: form,
            });

            if (response.ok) {
                toast.success('Drive created successfully!');
                setFormData({
                    usreId: 0,
                    from: '',
                    to: '',
                    stops: [],
                    date: '',
                    time: '',
                    vehicleNumber: '',
                    carModel: '',
                    capacity: '',
                    licenseNumber: '',
                    carPhotos: [],
                });
            } else {
                const data = await response.json();
                toast.error(data.message || 'Something went wrong.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred while submitting the form.');
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="container mt-4">
            <h3 className="mb-4">Create Drive</h3>
            <form onSubmit={handleSubmit}>

                {/* Locations */}
                <span className="fw-bold mb-2 d-block">Locations</span>
                <div className="row mb-3">
                    <div className="col">
                        <label className="form-label">From</label>
                        <input
                            type="text"
                            className="form-control"
                            name="from"
                            value={formData.from}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col">
                        <label className="form-label">To</label>
                        <input
                            type="text"
                            className="form-control"
                            name="to"
                            value={formData.to}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Stops */}
                <span className="fw-bold mb-2 d-block">In-between Stops</span>
                <div className="mb-3">
                    <label className="form-label d-flex justify-content-between align-items-center">
                        Add Stops
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addStop}>
                            + Add Stop
                        </button>
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                        {formData.stops.map((stop, index) => (
                            <div key={index} className="d-flex align-items-center border rounded px-2 py-1">
                                <input
                                    type="text"
                                    className="form-control form-control-sm border-0 shadow-none w-auto"
                                    placeholder={`Stop ${index + 1}`}
                                    value={stop}
                                    onChange={(e) => handleStopChange(index, e.target.value)}
                                    style={{ width: 'fit-content', minWidth: '100px' }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm text-danger ms-1 p-0"
                                    onClick={() => removeStop(index)}
                                >
                                    ❌
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Route Preview */}
                <span className="fw-bold mb-2 d-block">Route Preview</span>
                <div className="mb-4">
                    <div className="fw-bold text-primary">
                        {formData.from &&
                            [formData.from, ...formData.stops.filter(s => s.trim() !== ''), formData.to]
                                .filter(Boolean)
                                .join(' ➝ ')}
                    </div>
                </div>

                {/* Date & Time */}
                <span className="fw-bold mb-2 d-block">Date & Time</span>
                <div className="row mb-3">
                    <div className="col">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-control"
                            name="date"
                            min={today}
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col">
                        <label className="form-label">Time</label>
                        <input
                            type="time"
                            className="form-control"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Vehicle Info */}
                <span className="fw-bold mb-2 d-block">Vehicle Info</span>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <label className="form-label">Vehicle Number (e.g., TN39KS3333)</label>
                        <input
                            type="text"
                            className="form-control"
                            name="vehicleNumber"
                            value={formData.vehicleNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Car Model</label>
                        <input
                            type="text"
                            className="form-control"
                            name="carModel"
                            value={formData.carModel}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Capacity</label>
                        <input
                            type="number"
                            min="1"
                            className="form-control"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">License Number</label>
                        <input
                            type="text"
                            className="form-control"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Car Photos */}
                <span className="fw-bold mb-2 d-block">Car Photos</span>
                <div className="mb-3">
                    <label className="form-label">Upload Car Photos (exactly 5, unique)</label>
                    <input
                        type="file"
                        className="form-control"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <div className="mt-2 d-flex flex-wrap gap-2">
                        {formData.carPhotos.map((file, index) => (
                            <div
                                key={index}
                                className="d-flex align-items-center bg-light border rounded px-2 py-1"
                                style={{ fontSize: '0.875rem' }}
                            >
                                <span className="me-2">{file.name}</span>
                                <button
                                    type="button"
                                    className="btn btn-sm text-danger p-0"
                                    onClick={() => {
                                        const updatedFiles = [...formData.carPhotos];
                                        updatedFiles.splice(index, 1);
                                        setFormData(prev => ({ ...prev, carPhotos: updatedFiles }));
                                    }}
                                >
                                    ❌
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">Create Drive</button>
            </form>

            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </div>
    );
}

export default CreateDrive;