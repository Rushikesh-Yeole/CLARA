import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

// Token constant - this must match what's used in the Form component
const ACCESS_TOKEN = 'access_token';

function ProtectedRoutes({ children }) {
  const [isAuthorized, setAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Get token from localStorage
    const token = localStorage.getItem(ACCESS_TOKEN);
    
    if (!token) {
      console.log("No token found");
      setAuthorized(false);
      setIsLoading(false);
      return;
    }

    try {
      // Make request to the auth/me endpoint with Bearer token
      const response = await axios.get("http://localhost:8000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Auth response:", response.data);
      if (response.status === 200) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    } catch (error) {
      console.error("Auth error:", error.response?.status, error.response?.data);
      // Log token for debugging (remove in production)
      console.error("Token used:", token);
      localStorage.removeItem(ACCESS_TOKEN);
      setAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Verifying authentication...</div>
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to='/login' />;
}

export default ProtectedRoutes;