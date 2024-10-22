import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import HeaderComponent from "./components/HeaderComponent";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { ConfigProvider } from "antd";
import PageNotFound from "./pages/PageNotFound";
import DriverRegistrationForm from "./pages/DriverRegistrationForm";
import RestrictUser from "./protected/RestrictUser";
import SuccessfulPage from "./pages/SuccessfulPage";
import UserProtected from "./protected/UserProtected";
import DriverProtected from "./protected/DriverProtected";
import PrivateRoute from "./protected/PrivateRoute";
import AdminProtected from "./protected/AdminProtected";

const App = () => {
  return (
    <ConfigProvider>
      <AuthProvider>
        <Router>
          <HeaderComponent />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<RestrictUser component={Login} />} />
            <Route
              path="/register"
              element={<RestrictUser component={Register} />}
            />
            <Route
              path="/user-dashboard"
              element={<UserProtected component={UserDashboard} />}
            />
            <Route
              path="/driver-dashboard"
              element={<DriverProtected component={DriverDashboard} />}
            />
            <Route
              path="/successful-delivery/:id"
              element={<PrivateRoute component={SuccessfulPage} />}
            />
            <Route
              path="/driver-form"
              element={<DriverProtected component={DriverRegistrationForm} />}
            />
            <Route
              path="/admin-dashboard"
              element={<AdminProtected component={AdminDashboard} />}
            />
            <Route path="/:else" element={<PageNotFound />} />
          </Routes>
          <Footer />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
