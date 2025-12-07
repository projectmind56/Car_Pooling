import React, { useEffect, useState } from "react";
import "./MyRide.css";
import { toast } from "react-toastify";

function MyRide() {
    const [rides, setRides] = useState([]);
    const [filteredRides, setFilteredRides] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelLoading, setCancelLoading] = useState(null);
    const [driverFeedback, setDriverFeedback] = useState(null);


    // Feedback states
    const [showFeedback, setShowFeedback] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState("");

    // Filters
    const [searchFrom, setSearchFrom] = useState("");
    const [searchTo, setSearchTo] = useState("");
    const [searchDate, setSearchDate] = useState("");

    useEffect(() => {
        fetchMyRides();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [rides, searchFrom, searchTo, searchDate]);

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

    const applyFilters = () => {
        let filtered = rides;

        if (searchFrom.trim() !== "") {
            filtered = filtered.filter(r =>
                r.ride.from.toLowerCase().includes(searchFrom.toLowerCase())
            );
        }
        if (searchTo.trim() !== "") {
            filtered = filtered.filter(r =>
                r.ride.to.toLowerCase().includes(searchTo.toLowerCase())
            );
        }
        if (searchDate !== "") {
            filtered = filtered.filter(r =>
                r.ride.dateTime.split("T")[0] === searchDate
            );
        }

        setFilteredRides(filtered);
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

    // Submit feedback
    const submitFeedback = async () => {
        if (rating === 0 || feedbackText.trim() === "") {
            toast.error("Please select star rating and write feedback.");
            return;
        }

        const token = localStorage.getItem("token");

        const payload = {
            driverId: selectedRide.ride.userId,
            driveId: selectedRide.ride.driveId,
            passengerId: selectedRide.passengerDetails.userId,
            rating,
            feedbackText, // match API property name
        };

        try {
            const res = await fetch("http://localhost:5218/api/Passenger/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to submit feedback");

            const savedFeedback = await res.json();

            // Immediately display the saved feedback
            setDriverFeedback(savedFeedback);
            setShowFeedback(false);
            setRating(0);
            setFeedbackText("");

            toast.success("Feedback submitted!");
        } catch (err) {
            console.error(err);
            toast.error("Error submitting feedback!");
        }
    };


    const openRideDetails = async (ride) => {
        if (!ride?.ride?.driveId || !ride?.passengerDetails?.userId) {
            console.error("Ride or passengerDetails missing IDs", ride);
            return;
        }

        console.log("Passenger ID:", ride.passengerDetails.userId);
        console.log("Drive ID:", ride.ride.driveId);

        setSelectedRide(ride);

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(
                `http://localhost:5218/api/Passenger/drive-feedback/${ride.ride.driveId}/${ride.passengerDetails.userId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.ok) {
                const data = await res.json();

                // If feedback exists, store it
                if (data.length > 0) {
                    // Assuming API returns an array
                    setDriverFeedback(data[0]);
                } else {
                    setDriverFeedback(null);
                }
            } else {
                console.error("Failed to fetch feedback, status:", res.status);
                setDriverFeedback(null);
            }
        } catch (err) {
            console.error("Failed to load feedback:", err);
            setDriverFeedback(null);
        }
    };




    if (loading) return <p>Loading rides...</p>;

    return (
        <div className="my-ride-container">

            {/* SEARCH BAR */}
           <div className="fluid-container">
    <h2 className="mb-3">Search Your Rides</h2>
    <div className="row g-2">
        <div className="col-md-4">
            <input
                type="text"
                className="form-control"
                placeholder="From..."
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
            />
        </div>
        <div className="col-md-4">
            <input
                type="text"
                className="form-control"
                placeholder="To..."
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
            />
        </div>
        <div className="col-md-4">
            <input
                type="date"
                className="form-control"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
            />
        </div>
    </div>
</div>


            {/* RIDE LIST */}
            <div className="ride-card-list">
                {filteredRides.map((r) => {
                    const status = getRideStatus(r.ride, r.passengerDetails);
                    return (
                        <div
                            key={r.passengerDetails.id}
                            className="card"
                            onClick={() => openRideDetails(r)}
                        >
                            <h3>{r.ride.from} → {r.ride.to}</h3>
                            <p>{new Date(r.ride.dateTime).toLocaleString()}</p>
                            <span className={getStatusClass(status)}>{status}</span>
                        </div>
                    );
                })}
            </div>

            {/* RIDE DETAILS MODAL */}
            {selectedRide && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <button className="close-btn" onClick={() => setSelectedRide(null)}>✖</button>

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

                            <h3>Passenger</h3>
                            <p>Name: {selectedRide.passengerDetails.name}</p>
                            <p>Status: {selectedRide.passengerDetails.status || "pending"}</p>

                            {/* Existing Feedback Display */}
                            {driverFeedback && (
                                <div className="feedback-section">
                                    <h3>Your Feedback</h3>

                                    {/* Stars */}
                                    <div className="star-rating">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <span
                                                key={s}
                                                className={s <= driverFeedback.rating ? "star selected" : "star"}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>

                                    <p className="feedback-text">"{driverFeedback.feedbackText}"</p>
                                </div>
                            )}


                            {/* Cancel button only for upcoming */}
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

                            {/* FEEDBACK BUTTON */}
                            {(getRideStatus(selectedRide.ride, selectedRide.passengerDetails) === "completed" ||
                                getRideStatus(selectedRide.ride, selectedRide.passengerDetails) === "cancelled") && (
                                    <button
                                        className="feedback-btn"
                                        onClick={() => setShowFeedback(true)}
                                        disabled={driverFeedback !== null} // Disable if feedback exists
                                    >
                                        {driverFeedback ? "Feedback Submitted" : "Give Feedback"}
                                    </button>
                                )}


                        </div>
                    </div>
                </div>
            )}

            {/* FEEDBACK MODAL */}
            {showFeedback && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <button className="close-btn" onClick={() => setShowFeedback(false)}>✖</button>

                        <h2>Rate Your Ride</h2>

                        {/* Star Rating */}
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={star <= rating ? "star selected" : "star"}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        {/* Feedback Input */}
                        <textarea
                            placeholder="Write your feedback..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                        ></textarea>

                        <button className="submit-btn" onClick={submitFeedback}>
                            Submit Feedback
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default MyRide;
