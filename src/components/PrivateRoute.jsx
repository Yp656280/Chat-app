import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode as jwt_decode } from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("userToken");
  const location = useLocation();
  // Check if the token exists and is valid
  const isAuthenticated = () => {
    if (!token) return false;
    try {
      const decoded = jwt_decode(token);
      // console.log(decoded);
      return decoded.exp * 1000 > Date.now(); // Token expiry check
    } catch (error) {
      return false;
    }
  };

  if (!isAuthenticated() && location.pathname === "/login") {
    return children;
  }

  if (!isAuthenticated() && location.pathname === "/signup") {
    return children;
  }
  if (!isAuthenticated() && location.pathname === "/") {
    return children;
  }

  if (!isAuthenticated() && location.pathname === "/chats") {
    return <Navigate to="/login" />;
  }
  if (isAuthenticated() && location.pathname === "/chats") {
    return children;
  }

  if (isAuthenticated() && location.pathname === "/login") {
    return <Navigate to="/chats" />;
  }

  if (isAuthenticated() && location.pathname === "/signup") {
    return <Navigate to="/chats" />;
  }
  if (isAuthenticated() && location.pathname === "/") {
    return <Navigate to="/chats" />;
  }
};

export default PrivateRoute;
