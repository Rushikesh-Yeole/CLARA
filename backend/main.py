from dotenv import load_dotenv
import io
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload
import tempfile
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from passlib.context import CryptContext
from typing import List
import os
# import logging
from pydantic import BaseModel
import face_recognition
import numpy as np
import cv2
from datetime import datetime
import pytz
import time
import asyncio
import base64

import gspread
from gspread import Cell
from oauth2client.service_account import ServiceAccountCredentials

app = FastAPI()
load_dotenv()
# Ledger
app.state.processtime = 0

# CORS setup
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient(os.getenv("MONGODB"))
db = client["attendance_system"]
teachers = db["teachers"]
students = db["students"]
videos = db["videos"]


STUDENT_IMAGES_FOLDER_ID=os.getenv("STUDENT_IMAGES_FOLDER_ID")
VIDEOS_FOLDER_ID=os.getenv("VIDEOS_FOLDER_ID")


# Google Drive API initialization
DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive']
service_account_info = json.loads(os.getenv("SERVICE_ACCOUNT_FILE"))
drive_credentials = service_account.Credentials.from_service_account_info(
    service_account_info, scopes=DRIVE_SCOPES
    )
drive_service = build('drive', 'v3', credentials=drive_credentials)

# Helper funcs
@app.delete("/delDB/{collection_name}")
async def deleteDB(collection_name: str):
    if collection_name in db.list_collection_names():
        db[collection_name].drop()
        return {"message": f"Collection '{collection_name}' deleted successfully"}
    return {"error": f"Collection '{collection_name}' not found"}

# GoogleDrive Helper funcs
def upload_to_drive(file_bytes, filename, folder_id, mimetype):
    file_metadata = {
        'name': filename,
        'parents': [folder_id]
    }
    media = MediaIoBaseUpload(io.BytesIO(file_bytes), mimetype=mimetype)
    file = drive_service.files().create(
        body=file_metadata, media_body=media, fields='id'
    ).execute()
    return file.get('id')

def download_from_drive(file_id):
    request = drive_service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    fh.seek(0)
    return fh.read()

def delete_from_drive(file_id):
    drive_service.files().delete(fileId=file_id).execute()

def create_folder(folder_name, parent_id):
    """Create a folder in Google Drive under the given parent folder."""
    file_metadata = {
        'name': folder_name,
        'parents': [parent_id],
        'mimeType': 'application/vnd.google-apps.folder'
    }
    folder = drive_service.files().create(body=file_metadata, fields='id').execute()
    return folder.get('id')

# logging.basicConfig(
#     level=logging.INFO, 
#     format="%(asctime)s [%(levelname)s] %(message)s",
#     handlers=[logging.StreamHandler()]
# )
# logger = logging.getLogger(__name__)

# Authenticate with Google Sheets API
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_dict(service_account_info, scope)
gsclient = gspread.authorize(creds)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.get("/")
async def root():
    return {"message": "Welcome to CLARA"}

class TeacherLogin(BaseModel):
    id: str
    password: str

class TeacherRegister(BaseModel):
    id: str
    name: str
    password: str
    classes: List[str]

class StudentRegistration(BaseModel):
    roll: str
    batch: str
    images: List[str]  # base64 encoded image strings

async def populateSheet(spreadsheet, cls: str):
    batch_offsets = {'e': 0, 'f': 23, 'g': 46, 'h': 69}
    # Header: "Roll number" in A1 and 50 blank cells for date columns
    header = [["Roll number"] + [""] * 50]
    try:
        # Create new worksheet (adjust rows/cols as needed)
        worksheet = await asyncio.to_thread(spreadsheet.add_worksheet, title=cls, rows=100, cols=51)
        # Update header in the new worksheet
        await asyncio.to_thread(worksheet.update, "A1", header)
        if len(cls) < 3:
            print(f"Invalid class format: {cls}")
            return
        grade, batch, section = cls[0], cls[1].lower(), cls[2]
        offset = batch_offsets.get(batch)
        if offset is None:
            print(f"Unknown batch letter in class {cls}")
            return
        # Generate roll numbers for 23 students
        roll_numbers = [[f"{grade}1{section}{offset + i:02d}"] for i in range(1, 24)]
        # Update roll numbers starting from cell A2
        await asyncio.to_thread(worksheet.update, "A2", roll_numbers)
    except Exception as e:
        print(f"Error processing class {cls}: {e}")

@app.get("/test")
async def test():
    print("Test endpoint reached", flush=True)
    return {"message": "Test successful"}

@app.post("/teacher")
async def regTeacher(teacher: TeacherRegister):
    try:
        if teachers.find_one({"teacher_id": teacher.id}):
            raise HTTPException(400, "Teacher already registered")
        teachers.insert_one({
            "teacher_id": teacher.id,
            "name": teacher.name,
            "password": pwd_context.hash(teacher.password)
        })
        spreadsheet_name = f"{teacher.id}_{teacher.name}"
        folder_id = os.getenv("ATTSHEET")
        # Create the spreadsheet (wrapped in asyncio.to_thread)
        spreadsheet = await asyncio.to_thread(gsclient.create, spreadsheet_name, folder_id=folder_id)
        # Process each class concurrently
        await asyncio.gather(*(populateSheet(spreadsheet, cls) for cls in teacher.classes))
        await asyncio.to_thread(spreadsheet.del_worksheet, spreadsheet.sheet1)
        return {"message": "Teacher registered successfully", "DB": spreadsheet_name}
    except Exception as e:
        print(f"Error in register_teacher: {e}")
        raise HTTPException(500, f"Internal Server Error: {e}")

@app.post("/login")
async def login(teacher: TeacherLogin):
    db_teacher = teachers.find_one({"username": teacher.id})
    if not db_teacher:
        raise HTTPException(status_code=400, detail="Invalid username")
    if not pwd_context.verify(teacher.password, db_teacher["password"]):
        raise HTTPException(status_code=400, detail="Invalid password")
    return {"message": "Login successful", "username": teacher.id}

@app.post("/student")
async def regStudent(student: StudentRegistration):
    if students.find_one({"roll": student.roll}):
        raise HTTPException(status_code=400, detail="Student already registered")

    image_ids = []  # This will store Drive file IDs
    encodings = []

    # Create a subfolder for this student using their roll number
    student_folder_id = create_folder(student.roll, STUDENT_IMAGES_FOLDER_ID)
    
    for idx, image_b64 in enumerate(student.images):
        try:
            # Remove header if present (e.g., "data:image/jpeg;base64,")
            if "," in image_b64:
                header, encoded = image_b64.split(",", 1)
            else:
                encoded = image_b64

            image_data = base64.b64decode(encoded)
        except Exception as e:
            print(f"Failed to decode image {idx}: {e}")
            continue

        # Upload the image to the student's subfolder on Google Drive
        filename = f"{student.roll}_{idx}.jpg"
        drive_file_id = upload_to_drive(
            file_bytes=image_data, 
            filename=filename, 
            folder_id=student_folder_id,  # Use the subfolder id
            mimetype="image/jpeg"
        )
        image_ids.append(drive_file_id)

        # Process the image for face encoding in memory
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            print(f"Warning: Failed to decode image for face recognition for {filename}")
            continue
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encoding_list = face_recognition.face_encodings(rgb_img)
        if encoding_list:
            encodings.append(encoding_list[0].tolist())
        else:
            print(f"Warning: No face detected in image {filename}")

    # Save the student's data in MongoDB, including the student folder ID
    student_data = {
        "roll": student.roll,
        "batch": student.batch,
        "student_folder_id": student_folder_id,  # Useful if you want to access the folder later
        "image_ids": image_ids,  # Drive file IDs for images
        "encodings": encodings,
    }
    students.insert_one(student_data)
    return {"message": f"Student {student.roll} registered successfully"}
    
@app.post("/video")
async def storeVideo(
    id: str = Form(...),
    batch: str = Form(...),
    video: UploadFile = File(...)
):
    teacher = teachers.find_one({"teacher_id": id})
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    video_bytes = await video.read()

    filename = f"{id}_{batch}_{video.filename}"

    drive_file_id = upload_to_drive(
        file_bytes=video_bytes,
        filename=filename,
        folder_id=VIDEOS_FOLDER_ID,
        mimetype=video.content_type
    )

    video_data = {
        "teacher_id": id,
        "batch": batch,
        "video_file_id": drive_file_id,
        "status": "pending"
    }
    db["videos"].insert_one(video_data)

    return {"message": "Video uploaded. Attendance updation in 1 Day."}

@app.post("/flow")
async def queueVideos(background_tasks: BackgroundTasks):
    scan_videos = list(videos.find({"status": "pending"}))
    if not scan_videos:
        raise HTTPException(status_code=404, detail="No videos found")
    
    for video_data in scan_videos:
        background_tasks.add_task(scanVideo, video_data["teacher_id"], video_data["video_file_id"], video_data["batch"], video_data["_id"])

    return {"message": f"Video processing started for {len(scan_videos)} videos."}

# @app.post("/flow")
# async def process_pending_videos(background_tasks: BackgroundTasks):
#     # Fetch all pending videos
#     pending_videos = list(videos.find({"status": "pending"}))
#     if not pending_videos:
#         print("No pending videos to process.")
#         raise HTTPException(status_code=404, detail="No videos found")

#     print(f"Processing {len(pending_videos)} pending videos...")
#     for video_data in pending_videos:
#         background_tasks.add_task(scanVideo, video_data["teacher_id"], video_data["video_file_id"], video_data["batch"], video_data["_id"])

#     return {"message": f"Video processing started for {len(pending_videos)} videos."}

# Create and start the scheduler
# scheduler = AsyncIOScheduler()
# # Schedule the job to run daily at 1:00 AM server time
# scheduler.add_job(process_pending_videos, trigger='cron', hour=0, minute=29)
# scheduler.start()

async def scanVideo(teacher_id, video_file_id, batch, video_id):
    start_time = time.time()
    try:
        # Load student encodings remains the same...
        pstudents = list(students.find({"batch": batch}))
        known_face_encodings = []
        known_face_names = []
        detected_students = set()

        for student in pstudents:
            encodings = student.get("encodings", [])
            if encodings:
                for enc in encodings:
                    known_face_encodings.append(np.array(enc))
                    known_face_names.append(student["roll"])

        if not known_face_encodings:
            # logger.error(f"No encodings found for batch {batch}")
            return

        # Download video from Drive
        video_bytes = download_from_drive(video_file_id)
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            tmp_file.write(video_bytes)
            tmp_video_path = tmp_file.name

        try:
            # Process video using temporary file path
            video_capture = cv2.VideoCapture(tmp_video_path)
            total_frames = int(video_capture.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = video_capture.get(cv2.CAP_PROP_FPS)
            processed_frames = 0
            frames_per_second = 2
            max_frames_to_process = max(int((total_frames // max(fps, 30)) * frames_per_second), 10)

            print(f"Starting video from Drive file ID: {video_file_id}, FPS: {fps}, Total Frames: {total_frames}")

            while video_capture.isOpened() and processed_frames < min(max_frames_to_process, total_frames):
                target_frame = int(total_frames * (processed_frames / max_frames_to_process))
                video_capture.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
                ret, frame = video_capture.read()
                if not ret:
                    break

                frame = cv2.resize(frame, (960, 540))
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                print(f"Processing frame {target_frame}")
                frame_start = time.time()

                face_locations = face_recognition.face_locations(rgb_frame, model="hog")
                if face_locations:
                    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                    for face_encoding in face_encodings:
                        if len(detected_students) == len(set(known_face_names)):
                            break
                        
                        matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.4)
                        roll = "Unknown"
                        if True in matches:
                            first_match_index = matches.index(True)
                            roll = known_face_names[first_match_index]
                            if roll != "Unknown" and roll not in detected_students:
                                detected_students.add(roll)
                                print(f"{roll} detected in {time.time() - frame_start:.2f}s")
                processed_frames += 1

            video_capture.release()
        finally:
            # Always remove the temporary file
            if os.path.exists(tmp_video_path):
                os.remove(tmp_video_path)
    except Exception as e:
        print(f"Error processing video {video_file_id}: {e}")
    finally:
        # Cleanup: delete Drive file and remove DB record regardless of error
        videos.delete_one({"_id": video_id})
        delete_from_drive(video_file_id)

    total_time = time.time() - start_time
    app.state.processtime += total_time
    ist = pytz.timezone("Asia/Kolkata")
    current_date = datetime.now(ist).strftime("%Y-%m-%d")
    updateAtt(teacher_id, batch, current_date, list(detected_students))
    print(f"Finished video for batch {batch} in {app.state.processtime:.2f}s. Detected: {detected_students}")

def updateAtt(id, batch, date, present_students):
    try:
        # Find teacher details
        teacher = teachers.find_one({"teacher_id": id})
        if not teacher:
            raise Exception("Teacher not found")
        
        # Open the teacher's spreadsheet
        spreadsheet_name = f"{id}_{teacher['name']}"
        spreadsheet = gsclient.open(spreadsheet_name)

        # Find or create the batch-specific worksheet
        try:
            sheet = spreadsheet.worksheet(batch)
        except gspread.exceptions.WorksheetNotFound:
            sheet = spreadsheet.add_worksheet(title=batch, rows=100, cols=20)
            # Initialize header for roll numbers
            sheet.update_cell(1, 1, "Roll Number")
        
        # Ensure header row is correctly set up:
        header_row = sheet.row_values(1)
        if not header_row:
            # If header row is empty, set A1 to "Roll Number"
            sheet.update_cell(1, 1, "Roll Number")
            header_row = sheet.row_values(1)
        elif header_row[0] != "Roll Number":
            sheet.update_cell(1, 1, "Roll Number")
            header_row = sheet.row_values(1)
        
        # Check if the date column exists. If not, append the date as a new header.
        if date not in header_row:
            date_column = len(header_row) + 1
            sheet.update_cell(1, date_column, date)
        else:
            date_column = header_row.index(date) + 1
        
        # Get existing roll numbers (from A2 down)
        current_roll_numbers = sheet.col_values(1)[1:]  # skip header

        # Append any new roll numbers from present_students (if they are not already in column A)
        new_rolls = [roll for roll in present_students if roll not in current_roll_numbers]
        for roll in new_rolls:
            next_row = len(current_roll_numbers) + 2  # +2 because row indexing starts at 1 and row1 is header
            sheet.update_cell(next_row, 1, roll)
            current_roll_numbers.append(roll)

        # Prepare batch update for attendance for each roll number in column A.
        cell_updates = []
        for idx, roll in enumerate(current_roll_numbers, start=2):
            status = "Present" if roll in present_students else "Absent"
            cell_updates.append(Cell(row=idx, col=date_column, value=status))
        
        if cell_updates:
            sheet.update_cells(cell_updates, value_input_option='USER_ENTERED')
        
        print(f"Attendance updated for {id} in batch {batch} for {date}")
    except Exception as e:
        print(f"Error updating attendance: {e}")
        raise HTTPException(status_code=500, detail="Failed to update attendance")
    
@app.delete("/delStudent/{roll}")
async def delete_student(roll: str):
    student = students.find_one({"roll": roll})
    if not student:
        raise HTTPException(404, "Student not found")
    for fid in student.get("image_ids", []):
        delete_from_drive(fid)
    if student.get("student_folder_id"):
        delete_from_drive(student["student_folder_id"])
    students.delete_one({"roll": roll})
    return {"message": f"Student {roll} deleted successfully"}

@app.get("/students")
async def list_students():
    batches = {}
    for s in students.find({}, {"roll": 1, "batch": 1, "_id": 0}):
        batches.setdefault(s["batch"], []).append(s["roll"])
    return batches