import React, { useState } from 'react';
import axios from 'axios';

const RegisterStudent = () => {
  const [, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [batch, setBatch] = useState('');
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    setImages(e.target.files);
  };

  // Helper to convert a file to a base64 string
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convert each image file to base64
    const imagesBase64 = await Promise.all(
      Array.from(images).map((file) => convertToBase64(file))
    );
    const data = { roll, batch, images: imagesBase64 };

    try {
      const response = await axios.post('http://localhost:8000/student', data, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(response.data);
      // Optionally reset the form or display a success message
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div>
      <h2>Register Student</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Roll Number:</label>
          <input type="text" value={roll} onChange={(e) => setRoll(e.target.value)} />
        </div>
        <div>
          <label>Batch/Class:</label>
          <input type="text" value={batch} onChange={(e) => setBatch(e.target.value)} />
        </div>
        <div>
          <label>Upload Images:</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterStudent;
