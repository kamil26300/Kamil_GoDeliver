import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const AdminProtected = ({ component: Component, ...rest }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user.role === "admin" ? <Component {...rest} /> : <Navigate to="/" />;
};

export default AdminProtected;
