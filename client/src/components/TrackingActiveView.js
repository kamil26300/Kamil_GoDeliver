import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { Card, Typography, Space } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const libraries = ["places"];

const TrackingActiveView = () => {
  const navigate = useNavigate();
  const [driverLocation, setDriverLocation] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [directions, setDirections] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (booking) {
      const fetchDriverLocation = async () => {
        try {
          const response = await axios.get(
            `/api/drivers/${booking?._id}/location`
          );
          setDriverLocation(response.data.driverCurrentLocation);
          setBookingStatus(response.data.bookingStatus);
        } catch (error) {
          console.error("Error fetching driver location:", error);
        }
      };

      fetchDriverLocation();
      const interval = setInterval(fetchDriverLocation, 10000); // Update every 10 seconds

      return () => clearInterval(interval);
    }
  }, [booking?.driver]);

  useEffect(() => {
    if (driverLocation) {
      const directionsService = new window.google.maps.DirectionsService();

      let destination;
      if (bookingStatus === "accepted") {
        destination = {
          lat: booking?.pickupLocation.coordinates.coordinates[1],
          lng: booking?.pickupLocation.coordinates.coordinates[0],
        };
      } else if (bookingStatus === "in-progress") {
        destination = {
          lat: booking?.dropoffLocation.coordinates.coordinates[1],
          lng: booking?.dropoffLocation.coordinates.coordinates[0],
        };
      } else {
        return;
      }
      directionsService.route(
        {
          origin: { lat: driverLocation[1], lng: driverLocation[0] },
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            console.log("Updating");
            setDirections(result);
          }
        }
      );
    }
  }, [driverLocation, booking]);

  useEffect(() => {
    const fetchActiveBooking = async () => {
      try {
        const response = await axios.get("/api/bookings/user/active");
        setBooking(response.data);
      } catch (error) {
        console.error("Error fetching active booking:", error);
      }
    };

    fetchActiveBooking();
  }, []);

  useEffect(() => {
    if (bookingStatus === "completed") {
      navigate("/successful-delivery/" + booking?._id);
    }
  }, [bookingStatus]);

  return (
    <Card className="flex flex-col" title="Active Booking">
      {booking ? (
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Text className="font-bold gap-3 flex">
            Status: <p className="font-normal">{bookingStatus}</p>
          </Text>
          <Text className="font-bold gap-3 flex">
            Driver: <p className="font-normal">{booking.driver.name}</p>
          </Text>
          <Text className="font-bold gap-3 flex">
            Vehicle:<p className="font-normal"> {booking.vehicle.type}</p>
          </Text>
          <Text className="font-bold gap-3 flex">
            Pickup:
            <p className="font-normal">{booking.pickupLocation.address}</p>
          </Text>
          <Text className="font-bold gap-3 flex">
            Dropoff:
            <p className="font-normal"> {booking.dropoffLocation.address}</p>
          </Text>
          <LoadScript
            libraries={libraries}
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          >
            {booking && (
              <div className="mb-4">
                <GoogleMap
                  mapContainerStyle={{ height: "400px", width: "100%" }}
                  center={driverLocation || booking.pickupLocation}
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
                  {directions && (
                    <>
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
                        label={bookingStatus === "accepted" ? "P" : "D"}
                      />
                    </>
                  )}
                </GoogleMap>
              </div>
            )}
          </LoadScript>
        </Space>
      ) : (
        <p>No Active booking found</p>
      )}
    </Card>
  );
};

export default TrackingActiveView;
