import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/teacher">Register Teacher</Link></li>
        <li><Link to="/student">Register Student</Link></li>
        <li><Link to="/video">Upload Video</Link></li>
      </ul>
    </nav>
  );
};

export default Navigation;