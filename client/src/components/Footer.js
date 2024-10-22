import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const FooterComponent = () => {
  return (
    <Footer style={{ textAlign: 'center' }}>
      GoDeliver ©{new Date().getFullYear()} Created by Kamil Dehliwala
    </Footer>
  );
};

export default FooterComponent;