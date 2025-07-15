import React, { useState } from 'react';
import axios from 'axios';

const UploadVideo = () => {
  const [id, setId] = useState('');
  const [batch, setBatch] = useState('');
  const [video, setVideo] = useState(null);

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', id);
    formData.append('batch', batch);
    formData.append('video', video);
  
    try {
      const response = await axios.post('http://localhost:8000/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(response.data);
      // const res = await axios.post('http://localhost:8000/flow')
      // console.log(res.data);
      // Handle successful upload (e.g., display confirmation)
    } catch (error) {
      console.error('Video upload failed:', error);
    }
  };
  
  return (
    <div>
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Teacher ID:</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>
        <div>
          <label>Batch/Class:</label>
          <input
            type="text"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
          />
        </div>
        <div>
          <label>Upload Video (.mp4):</label>
          <input
            type="file"
            accept="video/mp4"
            onChange={handleVideoChange}
          />
        </div>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadVideo;