# 📸 CLARA – Smart Attendance System

CLARA (Cloud-based Attendance Recognition Automation): A sophisticated system leveraging facial recognition and cloud integration for automated, real-time attendance management.

**CLARA (Cloud-based Attendance Recognition Automation)** is an innovative attendance management system designed to streamline classroom attendance tracking using facial recognition.CLARA automates attendance marking from video input, integrating seamlessly with Google Sheets for real-time tracking and providing a modern, scalable solution for educational institutions.

**[Explore the Documentation](https://github.com/Rushikesh-Yeole/CLARA/tree/main/docs) | [Website](link to be updated)**

## 🌟 Overview
CLARA revolutionizes attendance management by replacing manual roll calls with automated, video-based facial recognition. It empowers teachers, reduces administrative overhead, and ensures accurate, real-time attendance records. Key features include:

- 🎥 **Video-Based Attendance**: Upload or capture classroom videos for automated attendance marking.
- 🤖 **Facial Recognition**: Leverages `face_recognition` to identify students with high accuracy.
- 🧾 **Google Sheets Integration**: Syncs attendance data to Google Sheets for easy access and reporting.
- 🖥️ **Full-Stack Experience**: Combines a sleek React frontend with a robust FastAPI backend.

## 💡 Why CLARA?
Traditional attendance systems are time-consuming and error-prone. CLARA addresses these challenges by:
- **Saving Time**: Automates attendance in seconds, freeing teachers for instruction.
- **Ensuring Accuracy**: Uses advanced facial recognition to minimize errors.
- **Enhancing Accessibility**: Provides real-time attendance data via Google Sheets.
- **Scaling Seamlessly**: Handles multiple classes and large student cohorts with ease.

## ⚙️ How It Works
1. **Teacher Registration**: Teachers sign up, auto create class-specific Google Sheets, and batchewise sheets.
2. **Student Enrollment**: Students are registered with face images, stored securely in Google Drive.
3. **Video Upload**: Teachers upload classroom videos, processed asynchronously for attendance.
4. **Face Recognition**: CLARA scans videos, identifies students, and marks attendance in Google Sheets.
5. **Real-Time Tracking**: Attendance data is updated instantly, accessible to teachers, admins and students (read-only).

## 🔧 Tech Stack
### Frontend
- **React.js**: Dynamic UI with React Router for navigation.
- **TailwindCSS**: Responsive, modern styling.
- **Webcam Integration**: Real-time video capture and preview.

### Backend
- **FastAPI**: High-performance REST APIs for video and data management.
- **MongoDB**: Stores teacher, student, and video metadata.
- **Face Recognition**: Powered by `face_recognition`, OpenCV, and NumPy.
- **Google APIs**: Drive for file storage, Sheets for attendance tracking.
- **Async Processing**: `asyncio` and `BackgroundTasks` for efficient video processing.

### Infrastructure
- **Google Drive**: Secure storage for student images and videos.
- **Environment Management**: `.env` for secure configuration.
- **Password Security**: Bcrypt hashing for teacher credentials.

## 🚀 Getting Started
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd clara
   ```
2. **Backend Setup**:
   - Install dependencies: `pip install -r backend/requirements.txt`
   - Configure `.env` with MongoDB URI, Google Service Account, and folder IDs (see [Documentation.md](https://github.com/Rushikesh-Yeole/CLARA/tree/main/docs)).
   - Run: `uvicorn backend.main:app --reload`
3. **Frontend Setup**:
   - Install dependencies: `cd frontend && npm install`
   - Run: `npm start`
4. **Access CLARA**:
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

## 📚 Documentation
Detailed backend API documentation is available in [Documentation.md](https://github.com/Rushikesh-Yeole/CLARA/tree/main/docs), covering endpoints, data models, and setup instructions.

## 🌍 Impact
- **Teachers**: Save time and focus on teaching, not admin tasks.
- **Students**: Benefit from streamlined processes and accurate records.
- **Institutions**: Gain real-time insights into attendance trends.
- **Scalability**: Supports schools of all sizes, from single classrooms to large campuses.

## 🔮 Future Enhancements
- Real-time video streaming for instant attendance updates.
- Email alerts for absent students using `smtplib`.
- Advanced analytics for attendance patterns.
- Mobile app integration for on-the-go access.

> 🌟That's It!