import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login'); // Replace '/' with your actual login route if different
  };

  const isActive = (path) => location.pathname === path;

  const isAuthenticated = !!localStorage.getItem('token') && !!localStorage.getItem('id');

  return (
    <div className="d-flex min-vh-100">
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

          <div
            className={`nav-item mb-1 ${isActive('/layout/upload-proof') ? 'active' : ''}`}
            onClick={() => navigate('/layout/upload-proof')}
          >
            <FontAwesomeIcon icon={faPersonRifle} />
            {isOpen && <span className="ms-2">Upload Proof</span>}
          </div>

          {/* ✅ Show Logout or Login */}
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

      <div className="flex-grow-1 p-4">
        <Outlet />
      </div>
    </div>
  );
}


export default Layout;
