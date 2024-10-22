import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import { AuthContext } from "../contexts/AuthContext";

const { Header } = Layout;

const HeaderComponent = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("home");

  const mapPath = {
    "/": "home",
    "/login": "login",
    "/register": "register",
  };

  useEffect(() => {
    if (location.pathname.includes("-dashboard")) {
      setSelectedKey("dashboard");
    } else {
      setSelectedKey(mapPath[location.pathname] || "");
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      key: "home",
      label: <Link to="/">Home</Link>,
    },
    ...(user
      ? [
          {
            key: "dashboard",
            label: <Link to={`/${user.role}-dashboard`}>Dashboard</Link>,
          },
          {
            key: "logout",
            label: (
              <Button
                onClick={handleLogout}
                type="text"
                style={{ color: "inherit" }}
              >
                Logout
              </Button>
            ),
          },
        ]
      : [
          {
            key: "login",
            label: <Link to="/login">Login</Link>,
          },
          {
            key: "register",
            label: <Link to="/register">Register</Link>,
          },
        ]),
  ];

  return (
    <Header>
      <div className="logo" />
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={menuItems}
      />
    </Header>
  );
};

export default HeaderComponent;
