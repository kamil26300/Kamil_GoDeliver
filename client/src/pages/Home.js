import React from "react";
import { Layout, Typography, Button, Space } from "antd";
import { Link } from "react-router-dom";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <Layout>
      <Content style={{ padding: "0 50px", marginTop: 64 }}>
        <div className="site-layout-content">
          <Title>Welcome to Our GoDeliver</Title>
          <Paragraph>
            We provide efficient and reliable transportation services for your
            goods. Whether you're a business owner or an individual, we've got
            you covered.
          </Paragraph>
          <Space>
            <Button type="primary" size="large">
              <Link to="/register">Get Started</Link>
            </Button>
            <Button size="large">
              <Link to="/login">Login</Link>
            </Button>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default Home;
