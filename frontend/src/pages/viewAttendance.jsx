import React, { useEffect, useState } from "react";
import axios from "axios";

function ViewAttendance() {
    const [spreadsheetUrl, setSpreadsheetUrl] = useState("");

    useEffect(() => {
        // Fetch the spreadsheet URL from the backend
        axios.get(`http://localhost:8000/getSpreadsheetUrl?teacher_id=123`) // Replace '123' with the actual teacher ID
            .then((response) => {
                const url = response.data.url;
                console.log("Spreadsheet URL:", url);
                const spreadsheetId = url.split("/d/")[1].split("/")[0]; // Extract the spreadsheet ID
                const embedUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/preview`;
                setSpreadsheetUrl(embedUrl);
            })
            .catch((error) => {
                console.error("Error fetching spreadsheet URL:", error);
            });
    }, []);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            {spreadsheetUrl ? (
                <iframe
                    src={spreadsheetUrl}
                    width="100%"
                    height="600"
                    style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                    title="Attendance Spreadsheet"
                    allowFullScreen
                ></iframe>
            ) : (
                <p>Loading attendance...</p>
            )}
        </div>
    );
}

export default ViewAttendance;