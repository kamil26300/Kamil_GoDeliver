import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const DriverProtected = ({ component: Component, ...rest }) => {
  const { user, loading, isDriverRegistered } = useContext(AuthContext);
  const location = useLocation();
  const isDriverFormPage = location.pathname === "/driver-form";

  if (loading) {
    return <div>Loading...</div>;
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // For /driver-form page
  if (isDriverFormPage) {
    // Redirect non-drivers away from driver-form
    if (user.role !== "driver") {
      return <Navigate to="/" />;
    }
    // Redirect already registered drivers away from driver-form
    if (isDriverRegistered) {
      return <Navigate to="/driver-dashboard" />;
    }
  }
  // For other protected driver routes
  else {
    // If user is driver but not registered, redirect to driver-form
    if (user.role === "driver" && !isDriverRegistered) {
      return <Navigate to="/driver-form" />;
    }
    // If user is not a driver, redirect to login
    if (user.role !== "driver") {
      return <Navigate to="/login" />;
    }
  }

  // If all checks pass, render the component
  return <Component {...rest} />;
};

export default DriverProtected;