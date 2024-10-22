import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Result, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const SuccessfulPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Result
        status="success"
        title="Delivery Successful!"
        subTitle={`Your booking (ID: ${id}) has been successfully completed.`}
        extra={[
          <Button 
            type="primary" 
            key="home" 
            icon={<HomeOutlined />}
            onClick={handleGoHome}
          >
            Return to Home
          </Button>
        ]}
      />
    </div>
  );
};

export default SuccessfulPage;