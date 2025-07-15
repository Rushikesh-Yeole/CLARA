import React, { useState } from 'react';
import axios from 'axios';

const RegisterStudent = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [classes, setClasses] = useState([]);

  const handleClassInputKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setClasses([...classes, e.target.value.trim()]);
      e.target.value = ''; // Clear the input field after adding
      e.preventDefault(); // Prevent form submission on Enter
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();  
    try {
      const response = await axios.post('http://localhost:8000/teacher', {id, name, password, classes});
      console.log(response.data);
      // Handle successful registration (e.g., clear form or show success message)
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div>
      <h2>Register Teacher</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID:</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Classes:</label>
          <input
            type="text"
            onKeyDown={handleClassInputKeyPress}
            placeholder="Press Enter to add class"
          />
        </div>
        <div>
          <label>Added Classes:</label>
          <ul>
            {classes.map((className, index) => (
              <li key={index}>{className}</li>
            ))}
          </ul>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterStudent;