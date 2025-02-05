import React, { useState, useEffect } from "react";
import { Form, Input, Select, Button, message, Card } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const DriverRegistrationForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [vehicles, setVehicles] = useState();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const getAllVehicles = async () => {
      const response = await axios.get(
        process.env.REACT_APP_BACKEND + "/api/vehicles"
      );
      setVehicles(response.data);
    };
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            type: "Point",
            coordinates: [position.coords.longitude, position.coords.latitude],
          });
        },
        (error) => {
          message.error(
            "Unable to retrieve your location. Please enable location services."
          );
        }
      );
    } else {
      message.error("Geolocation is not supported by your browser.");
    }
    getAllVehicles();
  }, []);

  const onFinish = async (values) => {
    if (!location) {
      message.error("Location is required. Please enable location services.");
      return;
    }
    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND + "/api/drivers/register",
        {
          ...values,
          currentLocation: location,
        }
      );
      message.success("Registration successful!");
      navigate("/driver-dashboard");
    } catch (error) {
      message.error("Registration failed. Please try again.");
    }
  };

  return (
    <Card title="Driver Register" className="max-w-md mx-auto">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="licenseNumber"
          label="License Number: Eg. 'MH00 12345678901'"
          rules={[
            { required: true, message: "Please input your license number!" },
            { pattern: /^[A-Z]{2}\d{2} \d{11}$/, message: "Incorrect format" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="vehicleNumber"
          label="Vehicle Number Plate: Eg. 'MH00 CE 3241'"
          rules={[
            { required: true, message: "Please input your license number!" },
            {
              pattern: /^[A-Z]{2}\d{2} [A-Z]{2} \d{4}$/,
              message: "Incorrect format",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="vehicleType"
          label="Vehicle Type"
          rules={[
            { required: true, message: "Please select your vehicle type!" },
          ]}
        >
          <Select>
            {vehicles?.map((vehicle, id) => (
              <Option key={id} value={vehicle.type}>
                {vehicle.type}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Register as Driver
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DriverRegistrationForm;
