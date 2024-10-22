import React, { useState, useEffect } from "react";
import { Card, Button, message, Table } from "antd";
import axios from "axios";
import { convertHH } from "./functions";

const TrackingCompletedView = ({ setActiveTab }) => {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchCompletedBooking = async () => {
      try {
        const response = await axios.get("/api/bookings/user/completed");
        setBooking(response.data);
      } catch (error) {
        console.error("Error fetching completed booking:", error);
      }
    };

    fetchCompletedBooking();
  }, []);

  const bookingColumns = [
    { title: "ID", dataIndex: "_id", key: "_id" },
    { title: "Driver Name", dataIndex: ["driver", "name"], key: "driverName" },
    { title: "Driver Email", dataIndex: ["driver", "email"], key: "driverEmail" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Price (₹)", dataIndex: "price", key: "price" },
    {
      title: "Trip Time",
      key: "tripTime",
      render: (text, record) => {
        const tripTime = record.tripTime;
        return tripTime ? convertHH(tripTime) : "N/A";
      },
    },
  ];

  return (
    <Card className="flex flex-col" title="Completed Booking">
      {booking?.length > 0 ? (
        <Table dataSource={booking} columns={bookingColumns} rowKey="_id" />
      ) : (
        <p>No Pending bookings found</p>
      )}
    </Card>
  );
};

export default TrackingCompletedView;
