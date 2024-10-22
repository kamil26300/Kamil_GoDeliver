import React, { useContext, useState, useEffect } from "react";
import { Layout, Typography, Card, Button, List, message } from "antd";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import {
  DirectionsRenderer,
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import OTPModal from "../components/OTPModal";

const { Content } = Layout;
const { Title } = Typography;
const libraries = ["places"];

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [directions, setDirections] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  useEffect(() => {
    fetchActiveBooking();
    fetchPendingBookings();
  }, []);

  useEffect(() => {
    // Start tracking user location
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error("Error getting location:", error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    // Set up interval to update route every 10 seconds
    const intervalId = setInterval(() => {
      // TODO: Not working every 10 seconds on page load
      if (userLocation && activeBooking) {
        console.log("Getting location in loop");
        updateRoute();
      }
    }, 10000);

    // Clean up
    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(intervalId);
    };
  }, [activeBooking]);

  const fetchActiveBooking = async () => {
    try {
      const response = await axios.get("/api/bookings/driver/active");
      setActiveBooking(response.data);
    } catch (error) {
      console.error("Error fetching active booking:", error);
    }
  };

  const fetchPendingBookings = async () => {
    try {
      const response = await axios.get("/api/bookings/driver/pending");
      setPendingBookings(response.data);
    } catch (error) {
      console.error("Error fetching pending bookings:", error);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await axios.post(`/api/bookings/${bookingId}/accept`);
      message.success("Booking accepted");
      fetchActiveBooking();
      fetchPendingBookings();
    } catch (error) {
      message.error("Failed to accept booking");
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, {status: "cancelled"});
      message.success("Booking cancelled");
      fetchPendingBookings()
    } catch (error) {
      message.error("Failed to update booking status");
    }
  };

  const handleOTPSuccess = async (status) => {
    try {
      await axios.put(`/api/bookings/${activeBooking._id}/status`, { status });
      message.success(`Booking ${status}`);
      if (status === "completed") {
        navigate("/successful-delivery/" + activeBooking._id);
      }
      fetchActiveBooking();
    } catch (error) {
      message.error("Failed to update booking status");
    }
  };

  const updateDriverLocation = async (location) => {
    try {
      await axios.put(`/api/drivers/${user._id}/location`, {
        latitude: location.lat,
        longitude: location.lng,
      });
    } catch (error) {
      console.error("Error updating driver location:", error);
    }
  };

  const updateRoute = () => {
    if (!userLocation || !activeBooking) return;

    const directionsService = new window.google.maps.DirectionsService();
    let destination;

    if (activeBooking.status === "accepted") {
      destination = {
        lat: activeBooking.pickupLocation.coordinates.coordinates[1],
        lng: activeBooking.pickupLocation.coordinates.coordinates[0],
      };
    } else if (activeBooking.status === "in-progress") {
      destination = {
        lat: activeBooking.dropoffLocation.coordinates.coordinates[1],
        lng: activeBooking.dropoffLocation.coordinates.coordinates[0],
      };
    } else {
      return; // Don't update route for other statuses
    }

    directionsService.route(
      {
        origin: userLocation,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        }
        updateDriverLocation(userLocation);
      }
    );
  };

  useEffect(() => {
    if (userLocation && activeBooking) {
      updateRoute();
    }
  }, [userLocation, activeBooking]);

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <Layout>
        <Content style={{ padding: "0 50px" }}>
          <div className="site-layout-content">
            <Title level={2}>Welcome, {user.name}</Title>
            {activeBooking ? (
              <Card className="flex flex-col" title="Active Booking">
                <div className="font-bold text-base grid grid-cols-5">
                  {/* User details */}
                  <div className="">
                    <p className="flex gap-4">
                      Name:
                      <span className="font-normal">
                        {activeBooking.user.name}
                      </span>
                    </p>
                    <p className="flex gap-4">
                      Phone Number:
                      <span className="font-normal">
                        {activeBooking.user.phone}
                      </span>
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="flex gap-4">
                      Pick Up:
                      <span className="font-normal">
                        {activeBooking.pickupLocation?.address}
                      </span>
                    </p>
                    <p className="flex gap-4">
                      Drop Off:
                      <span className="font-normal">
                        {activeBooking.dropoffLocation?.address}
                      </span>
                    </p>
                    <p className="flex gap-4">
                      Distance:
                      <span className="font-normal">
                        {activeBooking.distance} km
                      </span>
                    </p>
                    <p className="flex gap-4">
                      Price:
                      <span className="font-normal">
                        ₹{activeBooking.price}
                      </span>
                    </p>
                    <p className="flex gap-4">
                      Estimated Duration:
                      <span className="font-normal">
                        {activeBooking.estimatedDuration} mins
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col justify-around">
                    {activeBooking.status === "accepted" && (
                      <Button type="primary" onClick={() => setOtpModalVisible(true)}>
                        Start Trip
                      </Button>
                    )}
                    {activeBooking.status === "in-progress" && (
                      <Button
                        type="primary"
                        onClick={() => setOtpModalVisible(true)}
                      >
                        Complete Trip
                      </Button>
                    )}
                  </div>
                </div>
                {activeBooking && (
                  <div className="mb-4">
                    <GoogleMap
                      mapContainerStyle={{ height: "400px", width: "100%" }}
                      center={userLocation || activeBooking.pickupLocation}
                      zoom={12}
                      options={{
                        streetViewControl: false,
                        zoomControl: false,
                        scaleControl: false,
                        fullscreenControl: false,
                        cameraControl: false,
                        mapTypeControl: false,
                        rotateControl: false
                      }}
                    >
                      {directions && (
                        <DirectionsRenderer
                          directions={directions}
                          options={{
                            suppressMarkers: true,
                          }}
                        />
                      )}
                      <Marker
                        position={directions?.routes[0].legs[0].start_location}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: "#4285F4",
                          fillOpacity: 1,
                          strokeWeight: 1,
                          strokeColor: "#ffffff",
                        }}
                      />
                      <Marker
                        position={directions?.routes[0].legs[0].end_location}
                        label={activeBooking.status === "accepted" ? "P" : "D"}
                      />
                    </GoogleMap>
                  </div>
                )}
                <OTPModal
                  visible={otpModalVisible}
                  onCancel={() => setOtpModalVisible(false)}
                  bookingId={activeBooking?._id}
                  status={activeBooking?.status}
                  onSuccess={handleOTPSuccess}
                />
              </Card>
            ) : (
              <Card title="Pending Bookings">
                <List
                  dataSource={pendingBookings}
                  renderItem={(booking) => (
                    <List.Item
                      actions={[
                        <div className="flex flex-col gap-6">
                        <Button
                          onClick={() => cancelBooking(booking._id)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="primary"
                          onClick={() => handleAcceptBooking(booking._id)}
                        >
                          Accept
                        </Button>
                        </div>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div className="font-bold text-base grid grid-cols-2">
                            {/* User details */}
                            <div className="">
                              <p className="flex gap-4">
                                User Name:
                                <span className="font-normal">
                                  {booking.user.name}
                                </span>
                              </p>
                            </div>
                            <div className="">
                              <p className="flex gap-4">
                                Pick Up:
                                <span className="font-normal">
                                  {booking.pickupLocation?.address}
                                </span>
                              </p>
                              <p className="flex gap-4">
                                Drop Off:
                                <span className="font-normal">
                                  {booking.dropoffLocation?.address}
                                </span>
                              </p>
                              <p className="flex gap-4">
                                Distance:
                                <span className="font-normal">
                                  {booking.distance} km
                                </span>
                              </p>
                              <p className="flex gap-4">
                                Price:
                                <span className="font-normal">
                                  ₹{booking.price}
                                </span>
                              </p>
                              <p className="flex gap-4">
                                Estimated Duration:
                                <span className="font-normal">
                                  {booking.estimatedDuration} mins
                                </span>
                              </p>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </div>
        </Content>
      </Layout>
    </LoadScript>
  );
};

export default DriverDashboard;
