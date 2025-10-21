import React, { useEffect, useState } from 'react';
import './MyDrive.css';
import { toast } from 'react-toastify';

function MyDrive() {
  const [drives, setDrives] = useState([]);
  const [aadharPreview, setAadharPreview] = useState(null);

  const [filteredDrives, setFilteredDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    date: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to view your drives.');
      return;
    }

    const payload = parseJwt(token);
    const userId =
      payload?.[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];

    if (!userId) {
      toast.error('User not found. Please log in again.');
      return;
    }

    setLoading(true);
    fetch(`http://localhost:5218/api/Drive/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then((data) => {
        setDrives(data);
        setFilteredDrives(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load drives.');
      })
      .finally(() => setLoading(false));
  }, []);

  const parseDateAsIST = (dateStr) => {
    if (!dateStr) return null;
    const [datePart, timePart] = dateStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, secondMs] = timePart.split(':');
    const [second, ms] = secondMs ? secondMs.split('.').map(Number) : [0, 0];
    return new Date(year, month - 1, day, hour, minute, second, ms || 0);
  };

  const getNowIST = () => new Date();

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const statusColors = {
    Completed: 'gray',
    'Today / Upcoming': 'green',
    Upcoming: 'blue',
  };

  const getDriveStatus = (dateObj) => {
    const nowIST = getNowIST();
    if (dateObj < nowIST) return 'Completed';
    if (isSameDay(dateObj, nowIST)) return 'Today / Upcoming';
    return 'Upcoming';
  };

  const cancelDrive = (driveId) => {
    toast.info(`Cancel drive ID ${driveId} requested.`);
    setSelectedDrive(null);
    // TODO: implement cancel API
  };

  const applyFilters = () => {
    const { from, to, date, status } = filters;
    let result = [...drives];

    result = result.filter((drive) => {
      const driveDate = parseDateAsIST(drive.dateTime);
      const driveStatus = getDriveStatus(driveDate);

      return (
        (!from ||
          drive.from.toLowerCase().includes(from.toLowerCase())) &&
        (!to || drive.to.toLowerCase().includes(to.toLowerCase())) &&
        (!date || driveDate.toISOString().slice(0, 10) === date) &&
        (!status || driveStatus === status)
      );
    });

    setFilteredDrives(result);
  };

  const clearFilters = () => {
    setFilters({ from: '', to: '', date: '', status: '' });
    setFilteredDrives(drives);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between flex-wrap align-items-end mb-3">
        <div className="d-flex gap-2 align-items-center justify-content-between">
          <h3 className="mb-2 me-4">My Drives</h3>

          <div className="d-flex gap-2 justify-content-between ms-4">
            <input
              type="text"
              className="form-control"
              placeholder="From"
              style={{ minWidth: '120px' }}
              value={filters.from}
              onChange={(e) =>
                setFilters({ ...filters, from: e.target.value })
              }
            />
            <input
              type="text"
              className="form-control"
              placeholder="To"
              style={{ minWidth: '120px' }}
              value={filters.to}
              onChange={(e) =>
                setFilters({ ...filters, to: e.target.value })
              }
            />
            <input
              type="date"
              className="form-control"
              style={{ minWidth: '150px' }}
              value={filters.date}
              onChange={(e) =>
                setFilters({ ...filters, date: e.target.value })
              }
            />
            <select
              className="form-select"
              style={{ minWidth: '150px' }}
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Today / Upcoming">Today / Upcoming</option>
              <option value="Upcoming">Upcoming</option>
            </select>
            <button className="btn btn-primary" onClick={applyFilters}>
              Filter
            </button>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <span className="ms-2">Loading drives...</span>
        </div>
      ) : filteredDrives.length === 0 ? (
        <p>No drives found.</p>
      ) : (
        <div className="row g-4">
          {filteredDrives.map((drive) => {
            const dateObj = parseDateAsIST(drive.dateTime);
            const status = getDriveStatus(dateObj);
            const formattedDate = dateObj.toLocaleDateString('en-GB');
            const formattedTime = dateObj.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                className="col-12 col-sm-6 col-md-3"
                key={drive.driveId}
              >
                <div
                  className="card shadow h-100"
                  onClick={() => setSelectedDrive(drive)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="text-primary">
                        {drive.from} ➝ {drive.to}
                      </h6>
                      <div className="text-muted small">
                        Date: {formattedDate}
                        <br />
                        Time: {formattedTime}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span
                        style={{
                          color: statusColors[status],
                          fontWeight: 'bold',
                        }}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selectedDrive && (() => {
        const dt = parseDateAsIST(selectedDrive.dateTime);
        const status = getDriveStatus(dt);
        const fullRoute = [
          selectedDrive.from,
          ...(selectedDrive.stops
            ? selectedDrive.stops.split(',').map((s) => s.trim())
            : []),
          selectedDrive.to,
        ].join(' ➝ ');

        return (
          <div
            className="modal-backdrop"
            onClick={() => setSelectedDrive(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1050,
            }}
          >
            <div
              className="modal-content p-4"
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '700px',
                maxHeight: '80vh',
                overflowY: 'auto',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedDrive(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
                aria-label="Close"
              >
                &times;
              </button>

              <h5 className="text-primary">{fullRoute}</h5>
              <p>
                <strong>Date:</strong> {dt.toLocaleDateString('en-GB')}
                <br />
                <strong>Time:</strong>{' '}
                {dt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                <br />
                <strong>Status:</strong>{' '}
                <span
                  style={{
                    color: statusColors[status],
                    fontWeight: 'bold',
                  }}
                >
                  {status}
                </span>
              </p>
              <p>
                <strong>Vehicle Number:</strong>{' '}
                {selectedDrive.vehicleNumber}
                <br />
                <strong>Car Model:</strong> {selectedDrive.carModel}
                <br />
                <strong>Capacity:</strong> {selectedDrive.capacity}
                <br />
                <strong>Seat Left:</strong> {selectedDrive.capacityLeft}
                <br />
                <strong>License Number:</strong>{' '}
                {selectedDrive.licenseNumber}
              </p>

              <div className="d-flex flex-wrap gap-2 mt-3">
                {selectedDrive.carPhotoPaths?.map((path, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:5218${path}`}
                    alt={`Car ${idx + 1}`}
                    className="img-thumbnail"
                    style={{ width: '120px', height: 'auto' }}
                  />
                ))}
              </div>

              {/* ✅ Passenger Details Section */}
              {selectedDrive.passengers?.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-primary fw-bold">
                    Passenger Details:
                  </h6>
                  <div className="table-responsive mt-2">
                    <table className="table table-bordered table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Age</th>
                          <th>Phone</th>
                          <th>OTP</th>
                          <th>Aadhar Copy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDrive.passengers.map((p) => (
                          <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.email}</td>
                            <td>{p.age}</td>
                            <td>{p.phone}</td>
                            <td>{p.otp}</td>
                            <td>
                              {p.aadharCopy && p.aadharCopy.startsWith('/') ? (
                                <img
                                  src={`http://localhost:5218${p.aadharCopy}`}
                                  alt="Aadhar"
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                  }}
                                  onClick={() => setAadharPreview(`http://localhost:5218${p.aadharCopy}`)}
                                />
                              ) : (
                                'N/A'
                              )}

                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cancel button */}
              {(() => {
                const now = getNowIST();
                const sixHoursLater = new Date(
                  now.getTime() + 6 * 60 * 60 * 1000
                );
                const canCancel =
                  status === 'Upcoming' ||
                  (status === 'Today / Upcoming' && dt > sixHoursLater);

                if (status === 'Completed') return null;

                return canCancel ? (
                  <button
                    type="button"
                    className="btn btn-danger mt-3"
                    onClick={() => cancelDrive(selectedDrive.driveId)}
                  >
                    Cancel Drive
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary mt-3"
                    disabled
                  >
                    Cancel Not Available (Time Limit Exceeded)
                  </button>
                );
              })()}
            </div>
          </div>
        );
      })()}
      {aadharPreview && (
        <div
          className="aadhar-preview-overlay"
          onClick={() => setAadharPreview(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}
        >
          <img
            src={aadharPreview}
            alt="Aadhar Full"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '10px',
              boxShadow: '0 0 20px rgba(255,255,255,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setAadharPreview(null)}
            style={{
              position: 'fixed',
              top: '20px',
              right: '30px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '2rem',
              cursor: 'pointer',
            }}
            aria-label="Close Aadhar"
          >
            &times;
          </button>
        </div>
      )}

    </div>
  );
}

export default MyDrive;
