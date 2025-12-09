import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faBars,
  faTimes,
  faCar,
  faSignInAlt,
  faBridge
} from '@fortawesome/free-solid-svg-icons';
import './Home.css';
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
import { faPersonRifle } from '@fortawesome/free-solid-svg-icons/faPersonRifle';

function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  // ============================
  // 🔐 Decode JWT for Role
  // ============================
  const token = localStorage.getItem('token');
  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);

      role =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || null;

      // Save user id
      const userId =
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      if (userId) localStorage.setItem("id", userId);

    } catch (err) {
      console.error("Invalid Token:", err);
    }
  }

  const isAuthenticated = !!token;

  // Role conditions
  const isAdmin = role === "admin";
  const isUser = role === "user";

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex min-vh-100">

      {/* SIDEBAR */}
      <div className={`sidebar bg-primary text-white ${isOpen ? 'open' : 'collapsed'}`}>
        <div className="d-flex justify-content-between align-items-center p-3">
          <span className="fw-bold">{isOpen && 'Menu'}</span>
          <FontAwesomeIcon
            icon={isOpen ? faTimes : faBars}
            className="sidebar-toggle"
            onClick={toggleSidebar}
          />
        </div>

        <div className="nav flex-column px-2">

          {/* ============================
               USER MENU (NOT ADMIN)
          ============================ */}
          {isUser && (
            <>
              <div
                className={`nav-item mb-1 ${isActive('/layout/home') ? 'active' : ''}`}
                onClick={() => navigate('/layout/home')}
              >
                <FontAwesomeIcon icon={faHome} />
                {isOpen && <span className="ms-2">Home</span>}
              </div>

              <div
                className={`nav-item mb-1 ${isActive('/layout/get-drive') ? 'active' : ''}`}
                onClick={() => navigate('/layout/get-drive')}
              >
                <FontAwesomeIcon icon={faCar} />
                {isOpen && <span className="ms-2">Get Ride</span>}
              </div>

              <div
                className={`nav-item mb-1 ${isActive('/layout/create-drive') ? 'active' : ''}`}
                onClick={() => navigate('/layout/create-drive')}
              >
                <FontAwesomeIcon icon={faCar} />
                {isOpen && <span className="ms-2">Create Ride</span>}
              </div>

              <div
                className={`nav-item mb-1 ${isActive('/layout/my-drive') ? 'active' : ''}`}
                onClick={() => navigate('/layout/my-drive')}
              >
                <FontAwesomeIcon icon={faCar} />
                {isOpen && <span className="ms-2">My Drive</span>}
              </div>

              <div
                className={`nav-item mb-1 ${isActive('/layout/my-ride') ? 'active' : ''}`}
                onClick={() => navigate('/layout/my-ride')}
              >
                <FontAwesomeIcon icon={faBridge} />
                {isOpen && <span className="ms-2">My Ride</span>}
              </div>
            </>
          )}

          {/* ============================
               ADMIN MENU (ONLY THIS)
          ============================ */}
          {isAdmin && (
            <div
              className={`nav-item mb-1 ${isActive('/layout/view-users') ? 'active' : ''}`}
              onClick={() => navigate('/layout/view-users')}
            >
              <FontAwesomeIcon icon={faPersonRifle} />
              {isOpen && <span className="ms-2">View Users</span>}
            </div>
          )}

          {/* AUTH BUTTON */}
          <div
            className="nav-item mt-auto mb-2"
            onClick={isAuthenticated ? handleLogout : handleLogin}
          >
            <FontAwesomeIcon icon={isAuthenticated ? faSignOutAlt : faSignInAlt} />
            {isOpen && (
              <span className="ms-2">{isAuthenticated ? 'Logout' : 'Login'}</span>
            )}
          </div>

        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>

    </div>
  );
}

export default Layout;
