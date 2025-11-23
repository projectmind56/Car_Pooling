import React, { useEffect, useState } from "react";
import "./MyRide.css";

function MyRide() {
    const [rides, setRides] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(null);

    useEffect(() => {
        fetchMyRides();
    }, []);

    const fetchMyRides = async () => {
        setLoading(true);
        const userId = localStorage.getItem("id");
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:5218/api/Passenger/my-rides/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            let data = await res.json();

            // Sort rides: today → upcoming → completed → cancelled
            data.sort((a, b) => {
                const statusOrder = { today: 1, upcoming: 2, completed: 3, cancelled: 4 };
                const statusA = getRideStatus(a.ride, a.passengerDetails);
                const statusB = getRideStatus(b.ride, b.passengerDetails);
                return statusOrder[statusA] - statusOrder[statusB];
            });

            setRides(data);
        } catch (err) {
            console.error("Failed to fetch rides:", err);
        } finally {
            setLoading(false);
        }
    };

    const cancelPassengerRide = async (passengerId) => {
        try {
            setCancelLoading(passengerId);
            const token = localStorage.getItem("token");

            const res = await fetch(
                `http://localhost:5218/api/Passenger/cancel-ride/${passengerId}`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) throw new Error("Failed to cancel");

            setRides((prev) =>
                prev.map((r) =>
                    r.passengerDetails.id === passengerId
                        ? { ...r, passengerDetails: { ...r.passengerDetails, status: "cancelled" } }
                        : r
                )
            );

            if (selectedRide?.passengerDetails.id === passengerId) {
                setSelectedRide({
                    ...selectedRide,
                    passengerDetails: { ...selectedRide.passengerDetails, status: "cancelled" },
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCancelLoading(null);
        }
    };

    const getRideStatus = (ride, passenger) => {
        const rideDate = new Date(ride.dateTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (passenger.status === "cancelled") return "cancelled";
        if (rideDate < today) return "completed";
        if (rideDate.toDateString() === today.toDateString()) return "today";
        return "upcoming";
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "cancelled":
                return "status-cancelled";
            case "completed":
                return "status-completed";
            case "today":
                return "status-today";
            case "upcoming":
                return "status-upcoming";
            default:
                return "";
        }
    };

    if (loading) return <p>Loading rides...</p>;

    return (
        <div className="my-ride-container">
            <div className="ride-card-list">
                {rides.map((r) => {
                    const status = getRideStatus(r.ride, r.passengerDetails);
                    return (
                        <div
                            key={r.passengerDetails.id}
                            className="card"
                            onClick={() => setSelectedRide(r)}
                        >
                            <h3>{r.ride.from} → {r.ride.to}</h3>
                            <p>{new Date(r.ride.dateTime).toLocaleString()}</p>
                            <span className={getStatusClass(status)}>{status}</span>
                        </div>
                    );
                })}
            </div>

            {selectedRide && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <button className="close-btn" onClick={() => setSelectedRide(null)}>
                            ✖
                        </button>

                        <div className="modal-content">
                            <h2>{selectedRide.ride.from} → {selectedRide.ride.to}</h2>
                            <p>Date & Time: {new Date(selectedRide.ride.dateTime).toLocaleString()}</p>

                            <hr />

                            <h3>Driver Details</h3>
                            <p>Name: {selectedRide.driverName || "N/A"}</p>
                            <p>Email: {selectedRide.driverEmail || "N/A"}</p>
                            <p>Phone: {selectedRide.driverPhone || "N/A"}</p>

                            <h3>Car Details</h3>
                            <p>Model: {selectedRide.ride.carModel}</p>
                            <p>Vehicle No: {selectedRide.ride.vehicleNumber}</p>
                            <div className="car-images">
                                {selectedRide.ride.carPhotoPaths.map((path, idx) => (
                                    <img
                                        key={idx}
                                        src={`http://localhost:5218${path}`}
                                        alt={`Car ${idx}`}
                                        style={{ width: "100px", marginRight: "5px" }}
                                    />
                                ))}
                            </div>

                            <h3>Passenger Details</h3>
                            <p>Name: {selectedRide.passengerDetails.name}</p>
                            <p>Email: {selectedRide.passengerDetails.email}</p>
                            <p>Phone: {selectedRide.passengerDetails.phone}</p>
                            <p>Status: {selectedRide.passengerDetails.status || "pending"}</p>
                            <p>OTP: {selectedRide.passengerDetails.otp || "N/A"}</p>

                            {getRideStatus(selectedRide.ride, selectedRide.passengerDetails) === "upcoming" && (
                                <button
                                    className="cancel-btn"
                                    disabled={cancelLoading === selectedRide.passengerDetails.id}
                                    onClick={() => cancelPassengerRide(selectedRide.passengerDetails.id)}
                                >
                                    {cancelLoading === selectedRide.passengerDetails.id
                                        ? "Cancelling..."
                                        : "Cancel Ride"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyRide;
