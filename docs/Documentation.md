Here is your **GitHub-optimized Markdown version** of the **CLARA Backend Documentation** with professional formatting, clean code blocks, and visual clarity for improved readability on GitHub:

---

# CLARA Backend Documentation

## Overview

**CLARA** (Cloud-based Attendance Recognition Automation): A sophisticated system leveraging facial recognition and cloud integration for automated, real-time attendance management. Built with **FastAPI**, the backend integrates:

* **Facial recognition**
* **MongoDB** for data storage
* **Google Drive** for file handling
* **Google Sheets** for attendance tracking
* **Asynchronous video processing**

This document outlines endpoints, data models, and setup for scalable deployment and smooth frontend integration.

> 📌 Codebase available at [CLARA Backend Repository](https://github.com/Rushikesh-Yeole/CLARA)


---

## Tech Stack

* **Framework**: FastAPI
* **Database**: MongoDB (`pymongo`)
* **Facial Recognition**: `face_recognition`, OpenCV, NumPy
* **Google APIs**: Drive & Sheets
* **Authentication**: `passlib` (bcrypt)
* **Async Tools**: `asyncio`, `BackgroundTasks`, `apscheduler`
* **Environment**: Python 3.8+, configured via `.env`

---

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd clara/backend
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file:

```env
MONGODB=mongodb://<host>:<port>
SERVICE_ACCOUNT_FILE=<json-string-of-service-account-credentials>
STUDENT_IMAGES_FOLDER_ID=<google-drive-folder-id>
VIDEOS_FOLDER_ID=<google-drive-folder-id>
ATTSHEET=<google-drive-folder-id-for-sheets>
```

### 4. Run the Server

```bash
uvicorn main:app --reload
```

---

## Data Models

Pydantic models define structured input:

```python
class TeacherRegister(BaseModel):
    id: str           # e.g., "teacher123"
    name: str         # e.g., "Elon Musk"
    password: str     # plain password
    classes: List[str] # e.g., ["9eA", "10fB"]

class TeacherLogin(BaseModel):
    id: str
    password: str

class StudentRegistration(BaseModel):
    roll: str         # e.g., "9eA01"
    batch: str        # e.g., "9eA"
    images: List[str] # base64-encoded images
```

### MongoDB Collections

* `teachers`: Teacher IDs, names, bcrypt passwords
* `students`: Roll numbers, batch info, Drive folders, face encodings
* `videos`: Metadata (teacher, batch, file ID, status)

---

## API Endpoints

CLARA exposes REST endpoints for managing users, students, videos, and attendance.

---

### 1. `GET /`

* **Returns**: Welcome message
* **Response**:

```json
{"message": "Welcome to CLARA"}
```

```bash
curl http://localhost:8000/
```

---

### 2. `GET /test`

* **Tests server connectivity**
* **Response**:

```json
{"message": "Test successful"}
```

---

### 3. `POST /teacher`

* **Registers a teacher & creates a Google Sheet**
* **Request**:

```json
{
  "id": "XÆA‑12",
  "name": "Elon Musk",
  "password": "securepassword",
  "classes": ["9eA", "10fB"]
}
```

* **Response**:

```json
{
  "message": "Teacher registered successfully",
  "DB": "XÆA‑12_Elon Musk"
}
```

* **Errors**:

  * `400 Bad Request`: Already registered
  * `500 Internal Server Error`: Sheet creation failed

---

### 4. `POST /login`

* **Authenticates a teacher**
* **Request**:

```json
{
  "id": "XÆA‑12",
  "password": "securepassword"
}
```

* **Response**:

```json
{
  "message": "Login successful",
  "username": "Elon Musk"
}
```

* **Errors**:

  * `400 Bad Request`: Invalid credentials

---

### 5. `POST /student`

* **Registers a student & stores face encodings**
* **Request**:

```json
{
  "roll": "9eA01",
  "batch": "9eA",
  "images": ["base64image1", "base64image2"]
}
```

* **Response**:

```json
{"message": "Student 9eA01 registered successfully"}
```

* **Errors**:

  * `400 Bad Request`: Already registered

---

### 6. `POST /video`

* **Uploads a video for attendance tracking**

* **Request** (`multipart/form-data`):

  * `id`: e.g., `"XÆA‑12"`
  * `batch`: e.g., `"9eA"`
  * `video`: MP4 file

* **Response**:

```json
{"message": "Video uploaded. Attendance updation in 1 Day."}
```

* **Errors**:

  * `404 Not Found`: Teacher not found

---

### 7. `POST /flow`

* **Triggers background processing of pending videos**
* **Response**:

```json
{"message": "Video processing started for 3 videos."}
```

* **Errors**:

  * `404 Not Found`: No pending videos

---

### 8. `DELETE /delStudent/{roll}`

* **Deletes a student and their Drive images**
* **Path**: `roll` (e.g., `9eA01`)
* **Response**:

```json
{"message": "Student 9eA01 deleted successfully"}
```

* **Errors**:

  * `404 Not Found`: Student not found

---

### 9. `GET /students`

* **Lists all students grouped by batch**
* **Response**:

```json
{
  "9eA": ["9eA01", "9eA02"],
  "10fB": ["10fB01"]
}
```

---

## Video Processing

* **Async execution** using `BackgroundTasks`
* **Recognition** via `face_recognition` (HOG model)
* **Frame rate**: 2 FPS (adjustable)
* **Attendance marking**:

  * Students detected → Present
  * Others → Absent
* **Post-processing**: Videos removed from Google Drive & DB

---

## Error Handling

* Uses standard HTTP codes: `200`, `400`, `404`, `500`
* All errors return **descriptive JSON**
* Exceptions from Google APIs & processing are logged

---

## Security

* **CORS**: All origins allowed (development)
* **Passwords**: Hashed using `bcrypt`
* **Secrets**: Stored securely in `.env`

---

## Scalability

* **Async BackgroundTasks** prevent API blocking
* **MongoDB** stores encodings efficiently
* **Google Drive** handles scalable file storage
* **Optimized recognition** with frame sampling

---

## Future Enhancements

* Add **JWT authentication** for secured access
* Enable **real-time streaming** for quicker updates
* Integrate **email alerts** for absentees
* Explore **GPU-based or DeepFace** models for faster processing
 
> That's It!