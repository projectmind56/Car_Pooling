import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function GetDrive() {
    const [drives, setDrives] = useState([]);
    const [filteredDrives, setFilteredDrives] = useState([]);
    const [selectedDrive, setSelectedDrive] = useState(null);
    const [bookingDrive, setBookingDrive] = useState(null);
    const [passengerCount, setPassengerCount] = useState(0);
    const [passengers, setPassengers] = useState([]);
    const [errors, setErrors] = useState([]);
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        date: '',
        status: ''
    });

    const [isLoading, setIsLoading] = useState(false); // loader for page loads
    const [isSubmitting, setIsSubmitting] = useState(false); // loader for booking submit

    const parseDateAsIST = (dateStr) => {
        if (!dateStr) return null;
        // handle both full ISO with time and cases without ms
        const [datePart, timePart = '00:00:00'] = dateStr.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const timeSegments = timePart.split(':');
        const hour = parseInt(timeSegments[0] || 0, 10);
        const minute = parseInt(timeSegments[1] || 0, 10);
        const secondMs = timeSegments[2] || '0';
        const [second, ms] = secondMs.split?.('.').map(Number) ?? [Number(secondMs), 0];
        return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0, ms || 0);
    };

    const getNow = () => new Date();

    const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const getStatus = (dateObj) => {
        const now = getNow();
        if (dateObj < now) return 'Completed';
        if (isSameDay(dateObj, now)) return 'Today / Upcoming';
        return 'Upcoming';
    };

    const fetchDrives = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5218/api/Drive/drives');
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            setDrives(data);
            setFilteredDrives(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load drives.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDrives();
    }, []);


    const applyFilters = () => {
        const { from, to, date, status } = filters;
        const result = drives.filter((drive) => {
            const dateObj = parseDateAsIST(drive.dateTime);
            const driveStatus = getStatus(dateObj);
            const matchFrom = !from || (drive.from && drive.from.toLowerCase().includes(from.toLowerCase()));
            const matchTo = !to || (drive.to && drive.to.toLowerCase().includes(to.toLowerCase()));
            const matchDate = !date || (dateObj && dateObj.toISOString().slice(0, 10) === date);
            const matchStatus = !status || driveStatus === status;
            return matchFrom && matchTo && matchDate && matchStatus;
        });
        setFilteredDrives(result);
    };

    const clearFilters = () => {
        setFilters({ from: '', to: '', date: '', status: '' });
        setFilteredDrives(drives);
    };

    const startBooking = (drive) => {
        setBookingDrive(drive);
        setPassengerCount(0);
        setPassengers([]);
        setErrors([]);
    };

    const handlePassengerCountChange = (e) => {
        const count = parseInt(e.target.value || '0', 10);
        setPassengerCount(count);
        const emptyPassengers = Array.from({ length: count }, () => ({
            name: '',
            email: '',
            phone: '',
            age: '',
            // keep file object out of serialized payload but store base64 as aadhar string
            aadharFileName: '',
            aadhar: '' // base64 data URL string
        }));
        setPassengers(emptyPassengers);
        setErrors(Array(count).fill({}));
    };

    const handlePassengerFieldChange = (index, field, value) => {
        setPassengers(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // handle aadhar file change: single-image only; convert to base64 data URL and store in passenger.aadhar
    const handleAadharFileChange = (index, fileList) => {
        const file = fileList?.[0] ?? null;
        if (!file) {
            // clear if removed
            setPassengers(prev => {
                const updated = [...prev];
                updated[index] = { ...updated[index], aadhar: '', aadharFileName: '' };
                return updated;
            });
            return;
        }

        // validate single file only already ensured by input but double-check:
        if (fileList.length > 1) {
            setErrors(prev => {
                const newErr = [...prev];
                newErr[index] = { ...newErr[index], aadhar: 'Only one file allowed' };
                return newErr;
            });
            return;
        }

        // validate type (image/*)
        if (!file.type.startsWith('image/')) {
            setErrors(prev => {
                const newErr = [...prev];
                newErr[index] = { ...newErr[index], aadhar: 'Only image files are allowed (jpg, png, etc.)' };
                return newErr;
            });
            return;
        }

        // optional size check (e.g., limit 5MB)
        const maxSizeBytes = 5 * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setErrors(prev => {
                const newErr = [...prev];
                newErr[index] = { ...newErr[index], aadhar: 'File is too large. Max 5MB allowed.' };
                return newErr;
            });
            return;
        }

        // clear previous aadhar error
        setErrors(prev => {
            const newErr = [...prev];
            newErr[index] = { ...newErr[index], aadhar: undefined };
            return newErr;
        });

        // convert to base64 data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            setPassengers(prev => {
                const updated = [...prev];
                updated[index] = { ...updated[index], aadhar: dataUrl, aadharFileName: file.name };
                return updated;
            });
        };
        reader.onerror = (e) => {
            console.error('FileReader error', e);
            toast.error('Failed to read Aadhaar image.');
        };
        reader.readAsDataURL(file);
    };

    const validatePassengers = () => {
        let isValid = true;
        const newErrors = passengers.map((p) => {
            const error = {};
            if (!p.name || !p.name.trim()) {
                error.name = 'Name is required';
                isValid = false;
            }
            if (!p.email || !p.email.trim()) {
                error.email = 'Email is required';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
                error.email = 'Invalid email format';
                isValid = false;
            }
            if (!p.phone || !p.phone.trim()) {
                error.phone = 'Phone is required';
                isValid = false;
            } else if (!/^\d{10}$/.test(p.phone)) {
                error.phone = 'Phone must be 10 digits';
                isValid = false;
            }
            if (p.age === '' || p.age === null || p.age === undefined) {
                error.age = 'Age is required';
                isValid = false;
            } else {
                const age = parseInt(p.age, 10);
                if (isNaN(age) || age < 5 || age > 100) {
                    error.age = 'Age must be between 5 and 100';
                    isValid = false;
                }
            }

            // Aadhaar photo validation: must exist and should be image (we already validate on upload)
            if (!p.aadhar) {
                error.aadhar = 'Aadhaar photo is required (image only)';
                isValid = false;
            } else {
                // optionally ensure the string starts with data:image/
                if (typeof p.aadhar === 'string' && !p.aadhar.startsWith('data:image/')) {
                    error.aadhar = 'Aadhaar must be an image file';
                    isValid = false;
                }
            }

            return error;
        });
        setErrors(newErrors);
        return isValid;
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault(); // ← important if the button is inside a <form>
        if (!validatePassengers()) {
            alert('Please correct the errors before submitting.');
            return;
        }

        // read userId from localStorage
        const userId = localStorage.getItem('id');
        console.log(userId);

        if (userId === null) {
            alert('User not logged in');
            return;
        }
        console.log("handleBookingSubmit called");

        if (!bookingDrive || !bookingDrive.driveId) {
            alert('Invalid drive selected.');
            return;
        }

        // prepare payload
        const payload = {
            passengers: passengers.map((p) => ({
                userId: userId,
                driveId: bookingDrive.driveId,
                name: p.name,
                age: parseInt(p.age, 10),
                email: p.email,
                phone: p.phone,
                // include aadhar as base64 data URL string (backend schema expects string)
                aadhar: p.aadhar
            }))
        };

        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:5218/api/Passenger', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                // try to read response body to show any message
                let errText = `Request failed with status ${res.status}`;
                try {
                    const errJson = await res.json();
                    errText = errJson?.message || JSON.stringify(errJson);
                } catch (e) {
                    // fallback
                }
                throw new Error(errText);
            }

            const data = await res.json();
            toast.success(data?.message || 'Booking successful!');
            await fetchDrives(); // 🔁 refresh drives to show updated seats
            // reset booking UI
            setBookingDrive(null);
            setPassengerCount(0);
            setPassengers([]);
            setErrors([]);

        } catch (err) {
            console.error('Booking submit error', err);
            toast.error(`Failed to submit booking: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mt-4 position-relative">
            {/* Page loader */}
            {isLoading && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.7)'
                }}>
                    <div className="text-center">
                        <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <div className="mt-2">Loading drives...</div>
                    </div>
                </div>
            )}

            {/* Header + Filters */}
            <div className="d-flex justify-content-between flex-wrap align-items-end mb-3">
                <div className="d-flex gap-2 align-items-center justify-content-between">
                    <h3 className="mb-2">Get Drives</h3>

                    <div className="d-flex gap-2 justify-content-between ms-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="From"
                            style={{ minWidth: '120px' }}
                            value={filters.from}
                            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                        />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="To"
                            style={{ minWidth: '120px' }}
                            value={filters.to}
                            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                        />
                        <input
                            type="date"
                            className="form-control"
                            style={{ minWidth: '150px' }}
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        />
                        <select
                            className="form-select"
                            style={{ minWidth: '150px' }}
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All Status</option>
                            <option value="Completed">Completed</option>
                            <option value="Today / Upcoming">Today / Upcoming</option>
                            <option value="Upcoming">Upcoming</option>
                        </select>
                        <button className="btn btn-primary" onClick={applyFilters}>Filter</button>
                        <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
                    </div>
                </div>
            </div>

            {/* Card Grid */}
            {filteredDrives.length === 0 ? (
                <p>No drives found.</p>
            ) : (
                <div className="row g-4">
                    {filteredDrives.map((drive) => {
                        const dateObj = parseDateAsIST(drive.dateTime);
                        const status = getStatus(dateObj);
                        const formattedDate = dateObj ? dateObj.toLocaleDateString('en-GB') : '-';
                        const formattedTime = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
                        return (
                            <div className="col-12 col-sm-6 col-md-3" key={drive.driveId}>
                                <div className="card shadow h-100">
                                    <div className="card-body d-flex flex-column justify-content-between">
                                        <div onClick={() => setSelectedDrive(drive)} style={{ cursor: 'pointer' }}>
                                            <h6 className="text-primary">{drive.from} ➝ {drive.to}</h6>
                                            <div className="text-muted small">
                                                Date: {formattedDate}<br />
                                                Time: {formattedTime}
                                            </div>
                                            <div className="mt-2 fw-bold">{status}</div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-success mt-3"
                                            onClick={() => startBooking(drive)}
                                            disabled={drive.capacityLeft <= 0}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Drive Details Modal */}
            {selectedDrive && (
                <div className="modal-backdrop" onClick={() => setSelectedDrive(null)} style={backdropStyle}>
                    <div className="modal-content p-4" onClick={(e) => e.stopPropagation()} style={modalStyle}>
                        <button onClick={() => setSelectedDrive(null)} style={closeButtonStyle}>&times;</button>
                        {/* Profile Image */}
                        {selectedDrive.profileImagePath && (
                            <div className="text-center mb-3">
                                <img
                                    src={`http://localhost:5218${selectedDrive.profileImagePath}`}
                                    alt="Driver Profile"
                                    className="img-thumbnail"
                                    style={{ width: '120px', height: 'auto', borderRadius: '50%' }}
                                />
                            </div>
                        )}
                        <h4 className="mb-3 text-primary">
                            {[selectedDrive.from, ...(selectedDrive.stops?.split(',').map(s => s.trim()).filter(Boolean) || []), selectedDrive.to].join(' ➝ ')}
                        </h4>
                        <p>
                            <strong>Date:</strong> {parseDateAsIST(selectedDrive.dateTime)?.toLocaleDateString('en-GB')}<br />
                            <strong>Time:</strong> {parseDateAsIST(selectedDrive.dateTime)?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br />
                            <strong>Status:</strong> <b>{getStatus(parseDateAsIST(selectedDrive.dateTime))}</b>
                        </p>
                        <p>
                            <strong>Vehicle Number:</strong> {selectedDrive.vehicleNumber}<br />
                            <strong>Car Model:</strong> {selectedDrive.carModel}<br />
                            <strong>Capacity:</strong> {selectedDrive.capacity}<br />
                            <strong>Seat Left:</strong> {selectedDrive.capacityLeft}<br />
                            <strong>License Number:</strong> {selectedDrive.licenseNumber}
                        </p>
                        {/* Car Images */}
                        <div className="mb-3">
                            <strong>Car Images:</strong>
                            <div className="d-flex flex-wrap gap-2 mt-1">
                                {selectedDrive.carPhotoPaths?.map((path, i) => (
                                    <img key={i} src={`http://localhost:5218${path}`} alt={`Car ${i + 1}`} className="img-thumbnail" style={{ width: '150px' }} />
                                ))}
                            </div>
                        </div>
                        {/* License Image */}
                        {selectedDrive.licenseImagePath && (
                            <div className="mb-3">
                                <strong>License Image:</strong>
                                <div className="mt-1">
                                    <img src={`http://localhost:5218${selectedDrive.licenseImagePath}`} alt="License" className="img-thumbnail" style={{ width: '150px' }} />
                                </div>
                            </div>
                        )}
                        {/* RC Book Image */}
                        {selectedDrive.rcBookImagePath && (
                            <div className="mb-3">
                                <strong>RC Book Image:</strong>
                                <div className="mt-1">
                                    <img src={`http://localhost:5218${selectedDrive.rcBookImagePath}`} alt="RC Book" className="img-thumbnail" style={{ width: '150px' }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {bookingDrive && (
                <div className="modal-backdrop" onClick={() => { if (!isSubmitting) setBookingDrive(null); }} style={backdropStyle}>
                    <div className="modal-content p-4" onClick={(e) => e.stopPropagation()} style={modalStyle}>
                        <button onClick={() => { if (!isSubmitting) setBookingDrive(null); }} style={closeButtonStyle}>&times;</button>
                        <h5 className="mb-3">Booking for {bookingDrive.from} ➝ {bookingDrive.to}</h5>

                        <label><strong>Select number of persons:</strong></label>
                        <select className="form-select my-2" value={passengerCount} onChange={handlePassengerCountChange} disabled={isSubmitting}>
                            <option value="">-- Select --</option>
                            {Array.from({ length: bookingDrive.capacityLeft }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>

                        {passengers.map((passenger, index) => (
                            <div className="border p-3 rounded mb-3" key={index}>
                                <h6>Person {index + 1}</h6>
                                <div className="row g-2">
                                    <div className="col-md-6">
                                        <input
                                            type="text"
                                            className={`form-control ${errors[index]?.name ? 'is-invalid' : ''}`}
                                            placeholder="Name"
                                            value={passenger.name}
                                            onChange={(e) => handlePassengerFieldChange(index, 'name', e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                        {errors[index]?.name && <div className="invalid-feedback">{errors[index].name}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <input
                                            type="email"
                                            className={`form-control ${errors[index]?.email ? 'is-invalid' : ''}`}
                                            placeholder="Email"
                                            value={passenger.email}
                                            onChange={(e) => handlePassengerFieldChange(index, 'email', e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                        {errors[index]?.email && <div className="invalid-feedback">{errors[index].email}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <input
                                            type="tel"
                                            className={`form-control ${errors[index]?.phone ? 'is-invalid' : ''}`}
                                            placeholder="Phone"
                                            value={passenger.phone}
                                            onChange={(e) => handlePassengerFieldChange(index, 'phone', e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                        {errors[index]?.phone && <div className="invalid-feedback">{errors[index].phone}</div>}
                                    </div>
                                    <div className="col-md-6">
                                        <input
                                            type="number"
                                            className={`form-control ${errors[index]?.age ? 'is-invalid' : ''}`}
                                            placeholder="Age"
                                            value={passenger.age}
                                            onChange={(e) => handlePassengerFieldChange(index, 'age', e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                        {errors[index]?.age && <div className="invalid-feedback">{errors[index].age}</div>}
                                    </div>

                                    {/* Aadhaar photo input — only image allowed, only one file */}
                                    <div className="col-12 mt-2">
                                        <label className="form-label">Aadhaar Photo (image only)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className={`form-control ${errors[index]?.aadhar ? 'is-invalid' : ''}`}
                                            onChange={(e) => handleAadharFileChange(index, e.target.files)}
                                            disabled={isSubmitting}
                                        />
                                        {errors[index]?.aadhar && <div className="invalid-feedback d-block">{errors[index].aadhar}</div>}

                                        {/* preview small */}
                                        {passenger.aadhar && (
                                            <div className="mt-2">
                                                <small>Preview:</small>
                                                <div>
                                                    <img src={passenger.aadhar} alt={`aadhaar-${index}`} style={{ width: 120, borderRadius: 4 }} />
                                                    <div style={{ fontSize: 12 }}>{passenger.aadharFileName}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-primary"
                                onClick={handleBookingSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Submitting...
                                    </>
                                ) : 'Submit Booking'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { if (!isSubmitting) setBookingDrive(null); }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const backdropStyle = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1050,
};

const modalStyle = {
    backgroundColor: 'white', borderRadius: '8px', width: '90%',
    maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative',
};

const closeButtonStyle = {
    position: 'absolute', top: '10px', right: '10px', background: 'transparent',
    border: 'none', fontSize: '1.5rem', cursor: 'pointer',
};

export default GetDrive;