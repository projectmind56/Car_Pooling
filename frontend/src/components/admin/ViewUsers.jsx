import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = "http://localhost:5218/api/User";

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/getAllUsers`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data); // Initially show all users
    } catch (err) {
      console.error(err);
      alert("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update user status
  const deactivateUser = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;

    try {
      setUpdatingUserId(userId);
      const response = await fetch(`${API_BASE}/update-status/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "deactive" })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Failed to update status");
        return;
      }

      alert(result.message);
      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Handle dynamic search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = users.filter(user =>
      user.userName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phone.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  if (loading) return <div className="text-center mt-5">Loading users...</div>;

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4">All Users</h2>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by username, email, or phone"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-primary">
            <tr>
              <th>UserId</th>
              <th>UserName</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center">No users found</td>
              </tr>
            )}
            {filteredUsers.map(user => (
              <tr key={user.userId}>
                <td>{user.userId}</td>
                <td>{user.userName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.role}</td>
                <td>
                  {user.status === "active" ? (
                    <span className="badge bg-success">Active</span>
                  ) : (
                    <span className="badge bg-danger">Deactivated</span>
                  )}
                </td>
                <td>
                  {user.status === "active" ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => deactivateUser(user.userId)}
                      disabled={updatingUserId === user.userId}
                    >
                      {updatingUserId === user.userId ? "Deactivating..." : "Deactivate"}
                    </button>
                  ) : (
                    <span className="text-muted">Deactivated</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewUsers;
