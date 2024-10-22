import React, { useContext, useState } from "react";
import { Form, Input, Button, Card, Radio } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const res = await register(values);
    setLoading(false);
    if (res.status === 201) {
      const user = res.data.user;
      if (user.role === "user") {
        navigate("/user-dashboard");
      } else if (user.role === "driver") {
        navigate("/driver-form");
      }
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <Card title="Register" className="max-w-md mx-auto">
        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input your password!" },
              {
                min: 6,
                message: "Password must be at least 6 characters long!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please input your phone number!" },
              {
                pattern: /^\d{10}$/,
                message: "Phone number must be exactly 10 digits!",
              },
            ]}
          >
            <Input type="number" maxLength={10} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="role"
            label="Register as"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Radio.Group>
              <Radio value="user">User</Radio>
              <Radio value="driver">Driver</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
