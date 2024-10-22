import React, { createContext, useState, useEffect } from "react";
import { message } from "antd"
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isDriverRegistered, setIsDriverRegistered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check driver registration status whenever user changes
    if (user?.role === "driver") {
      console.log(user)
      checkDriverRegistration();
    } else {
      setIsDriverRegistered(false);
    }
  }, [user]);

  const checkDriverRegistration = async () => {
    try {
      const res = await axios.get("/api/drivers/isRegistered");
      setIsDriverRegistered(res.data.registered);
    } catch (error) {
      console.error("Error checking driver registration:", error);
      setIsDriverRegistered(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/users/profile");
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/users/login", { email, password });
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;
      message.success("Logged in successfully");
      return res;
    } catch (error) {
      message.error(error.response?.data?.message || "Login failed");
      return error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post("/api/users/register", userData);
      setUser(res.data.user);
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;
      message.success("Registered successfully");
      return res;
    } catch (error) {
      message.error(error.response?.data?.message || "Registration failed");
      return error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    message.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isDriverRegistered }}>
      {children}
    </AuthContext.Provider>
  );
};
