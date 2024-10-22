import React, { useContext, useState } from "react";
import { Form, Input, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    const res = await login(values.email, values.password);
    setLoading(false);
    if (res.status === 200) {
      navigate(`/${res.data.user.role}-dashboard`);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <Card title="Login" className="max-w-md mx-auto">
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
