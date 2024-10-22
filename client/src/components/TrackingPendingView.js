import React, { useState, useEffect } from "react";
import { Card, Button, message } from "antd";
import axios from "axios";

const TrackingPendingView = ({ setActiveTab }) => {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchPendingBooking = async () => {
      try {
        const response = await axios.get("/api/bookings/user/pending");
        setBooking(response.data);
      } catch (error) {
        console.error("Error fetching pending booking:", error);
      }
    };

    fetchPendingBooking();
  }, []);

  const cancelBooking = async () => {
    try {
      await axios.put(`/api/bookings/${booking._id}/status`, {status: "cancelled"});
      message.success("Booking cancelled");
      setActiveTab("1");
    } catch (error) {
      message.error("Failed to update booking status");
    }
  };

  return (
    <Card className="flex flex-col" title="Pending Booking">
      {booking ? (
        <div className="font-bold text-base grid grid-cols-5">
          <div className="col-span-4">
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
              <span className="font-normal">{booking.distance} km</span>
            </p>
            <p className="flex gap-4">
              Price:
              <span className="font-normal">₹{booking.price}</span>
            </p>
            <p className="flex gap-4">
              Estimated Duration:
              <span className="font-normal">
                {booking.estimatedDuration} mins
              </span>
            </p>
          </div>
          <div className="flex flex-col justify-around">
            {booking.status === "pending" && (
              <Button type="primary" onClick={cancelBooking}>Cancel</Button>
            )}
          </div>
        </div>
      ) : (
        <p>No Pending bookings found</p>
      )}
    </Card>
  );
};

export default TrackingPendingView;
