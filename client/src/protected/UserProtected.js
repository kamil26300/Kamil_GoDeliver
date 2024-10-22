import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const UserProtected = ({ component: Component, ...rest }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user.role === "user" ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default UserProtected;
