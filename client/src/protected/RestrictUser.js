import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const RestrictUser = ({ component: Component, ...rest }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return !user ? <Component {...rest} /> : <Navigate to={`/${user.role}-dashboard`} />;
};

export default RestrictUser;
