import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './components/Home/Home';
import Register from './components/authentication/Register';
import Login from './components/authentication/Login';
import Dashboard from './components/Home/Dashboard';
import Layout from './components/Home/Layout';
import CreateDrive from './components/User/CreateDrive';
import MyDrive from './components/User/MyDrive';
import GetDrive from './components/User/GetDrive';
import UploadDriverProof from './components/User/UploadDriverProof';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MyRide from './components/User/MyRide';
import ViewUsers from './components/admin/ViewUsers';

function App() {
  return (
    <>
      <BrowserRouter>
        {/* Toast container for global use */}
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/layout" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-drive" element={<CreateDrive />} />
            <Route path="my-drive" element={<MyDrive />} />
            <Route path="home" element={<Home />} />
            <Route path="get-drive" element={<GetDrive />} />
            <Route path="upload-proof" element={<UploadDriverProof />} />
            <Route path="my-ride" element={<MyRide />} />

            <Route path="view-users" element={<ViewUsers />} />

          </Route>
          
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
