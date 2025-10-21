import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UploadDriverProof() {
  const [licenseImage, setLicenseImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [rcBookImage, setRcBookImage] = useState(null);

  // Allowed image mime types
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PNG, JPG, and JPEG files are allowed.');
        e.target.value = ''; // reset input
        return;
      }
      setImage({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  };

const handleUpload = async () => {
  const driverId = localStorage.getItem('id');

  if (!driverId) {
    toast.error('Please log in to upload documents.');
    return;
  }

  if (!licenseImage || !profileImage || !rcBookImage) {
    toast.error('Please upload all required images.');
    return;
  }

  const formData = new FormData();
  formData.append('UserId', driverId);
  formData.append('LicenseImage', licenseImage.file);
  formData.append('ProfileImage', profileImage.file);
  formData.append('RcBookImage', rcBookImage.file);

  try {
    const response = await fetch('http://localhost:5218/api/Drive/upload-driver-proof', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      toast.success(data.message || 'Documents uploaded successfully!');
      // Optionally clear inputs here
    } else {
      const errorData = await response.json();
      toast.error(errorData.error || 'Upload failed.'); // <-- Correct key
    }
  } catch (error) {
    toast.error('Something went wrong. Please try again.');
  }
};


  return (
    <div className="container mt-4">
      <h3>Upload Driver Proof</h3>

      <div className="mb-3">
        <label className="form-label">License Image</label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="form-control"
          onChange={(e) => handleImageChange(e, setLicenseImage)}
        />
        {licenseImage && (
          <img
            src={licenseImage.preview}
            alt="License Preview"
            className="img-thumbnail mt-2"
            style={{ maxWidth: '200px' }}
          />
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Profile Picture</label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="form-control"
          onChange={(e) => handleImageChange(e, setProfileImage)}
        />
        {profileImage && (
          <img
            src={profileImage.preview}
            alt="Profile Preview"
            className="img-thumbnail mt-2"
            style={{ maxWidth: '200px' }}
          />
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">RC Book Image</label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          className="form-control"
          onChange={(e) => handleImageChange(e, setRcBookImage)}
        />
        {rcBookImage && (
          <img
            src={rcBookImage.preview}
            alt="RC Book Preview"
            className="img-thumbnail mt-2"
            style={{ maxWidth: '200px' }}
          />
        )}
      </div>

      <button className="btn btn-primary mt-3" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
}

export default UploadDriverProof;