import React, { useContext, useState } from "react";
import { Layout, Typography, Tabs } from "antd";
import { AuthContext } from "../contexts/AuthContext";
import BookingForm from "../components/BookingForm";
import TrackingActiveView from "../components/TrackingActiveView";
import TrackingPendingView from "../components/TrackingPendingView";
import TrackingCompletedView from "../components/TrackingCompletedView";

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("1");

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <Layout>
      <Content style={{ padding: "0 50px" }}>
        <div className="site-layout-content">
          <Title level={2}>Welcome, {user.name}</Title>
          <Tabs
            activeKey={activeTab}
            defaultActiveKey="1"
            onChange={handleTabChange}
          >
            <TabPane tab="New Booking" key="1">
              {activeTab === "1" && <BookingForm setActiveTab={setActiveTab} />}
            </TabPane>
            <TabPane tab="Pending Booking" key="2">
              {activeTab === "2" && <TrackingPendingView setActiveTab={setActiveTab} status="pending" />}
            </TabPane>
            <TabPane tab="Active Booking" key="3">
              {activeTab === "3" && <TrackingActiveView status="active" />}
            </TabPane>
            <TabPane tab="Completed Booking" key="4">
              {activeTab === "4" && <TrackingCompletedView />}
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default UserDashboard;
