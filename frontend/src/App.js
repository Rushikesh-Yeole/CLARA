import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Student from './components/Student';
import Teacher from './components/Teacher';
import UploadVideo from './components/UploadVideo';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/student" element={<Student />} />
      <Route path="/teacher" element={<Teacher />} />
      <Route path="/video" element={<UploadVideo />} />
      </Routes>
    </Router>
  );
}

export default App;