import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Tabs,
  Table,
  Card,
  Statistic,
  Row,
  Col,
} from "antd";
import axios from "axios";
import { convertHH } from "../components/functions";

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const addTime = (a, b) => {
    return new Date(new Date(a).getTime() + b * 60 * 1000).toISOString();
  };

  const calculateTripTime = (startDate, endDate) => {
    const differenceInMs = new Date(endDate) - new Date(startDate);
    const totalMinutes = Math.floor(differenceInMs / 1000 / 60);
    return convertHH(totalMinutes);
  };

  const fetchData = async () => {
    try {
      const [usersRes, driversRes, bookingsRes, statsRes] = await Promise.all([
        axios.get("/api/admin/users"),
        axios.get("/api/admin/drivers"),
        axios.get("/api/admin/bookings"),
        axios.get("/api/admin/stats"),
      ]);
      setUsers(usersRes.data);
      setDrivers(driversRes.data);
      setBookings(bookingsRes.data);
      // console.log(addTime(bookingsRes.data[2].startTime, bookingsRes.data[2].estimatedDuration))
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  const userColumns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Total Bookings Completed",
      dataIndex: "totalBookings",
      key: "totalBookings",
    },
    {
      title: "Total Amount Paid (₹)",
      dataIndex: "totalPayment",
      key: "totalPayment",
    },
  ];

  const driverColumns = [
    { title: "Name", dataIndex: ["user", "name"], key: "name" },
    { title: "Email", dataIndex: ["user", "email"], key: "email" },
    { title: "Vehicle Type", dataIndex: "vehicleType", key: "vehicleType" },
    {
      title: "Status",
      dataIndex: "isAvailable",
      key: "isAvailable",
      render: (isAvailable) => (isAvailable ? "Available" : "Busy"),
    },
  ];

  const bookingColumns = [
    { title: "ID", dataIndex: "_id", key: "_id" },
    { title: "User", dataIndex: ["user", "name"], key: "user" },
    { title: "Driver", dataIndex: ["driver", "name"], key: "driver" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Price (₹)", dataIndex: "price", key: "price" },
    {
      title: "Trip Time",
      key: "time",
      render: (text, record) => {
        const startDate = record.startTime;
        const endDate = record.endTime;
        return endDate && startDate
          ? calculateTripTime(startDate, endDate)
          : "N/A";
      },
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: "0 50px" }}>
        <div className="site-layout-content">
          <Title level={2}>Admin Dashboard</Title>
          <Row gutter={20}>
            <Col span={4}>
              <Card>
                <Statistic title="Total Users" value={stats.totalUsers} />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic title="Total Drivers" value={stats.totalDrivers} />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic title="Total Bookings" value={stats.totalBookings} />
              </Card>
            </Col>
            <Col span={4}>
              <Card>
                <Statistic
                  title="Average Trip Time"
                  value={convertHH(stats.avgTripTime)}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Revenue"
                  value={stats.totalRevenue}
                  prefix="₹"
                />
              </Card>
            </Col>
          </Row>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Users" key="1">
              <Table dataSource={users} columns={userColumns} rowKey="_id" />
            </TabPane>
            <TabPane tab="Drivers" key="2">
              <Table
                dataSource={drivers}
                columns={driverColumns}
                rowKey="_id"
              />
            </TabPane>
            <TabPane tab="Bookings" key="3">
              <Table
                dataSource={bookings}
                columns={bookingColumns}
                rowKey="_id"
              />
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminDashboard;
