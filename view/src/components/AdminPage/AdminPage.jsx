import React, { Component } from 'react';
import './AdminPage.css';
import ucla_logo from "../../static/ucla.png";
import UserMainPage from "../UserMainPage/UserMainPage";
import PendingReport from "../PendingReport/PendingReport";
import Authorization from "../Authorization/Authorization";

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Layout, Menu, Breadcrumb, Button } from 'antd';
import { UserOutlined, LaptopOutlined, NotificationOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { LoginContextProvider, LoginContext } from '../../LoginContext';
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;


class AdminPage extends Component {
  static contextType = LoginContext;
  state = {};

  render() {
    if (!JSON.parse(localStorage.getItem('user'))) {
      return <div> You have not yet logged in </div>;
    } else {
      return (
        <LoginContextProvider>
          <Router>
            <Layout>
              <Header style={{ background: '#03a9f4' }}>
                <div>
                  <span className='logo_creat'>CREAT<span className='logo_e'>e</span></span>

                </div>
              </Header>
              <Layout>
                <Sider width={200} className="site-layout-background">
                  <Menu
                    mode="inline"
                    style={{ height: '100%', borderRight: 0 }}
                  >
                    <Menu.Item key="main" icon={<HomeOutlined />} title="Home" >
                      <Button type="link" href='/search'>Home</Button>
                    </Menu.Item>

                    <SubMenu key="operations" icon={<LaptopOutlined />} title="Operations">
                      <Menu.Item key="operation1">user info<Link to="/user/main" /></Menu.Item>
                      <Menu.Item key="operation2">pending report<Link to="/user/pending" /></Menu.Item>
                      {JSON.parse(localStorage.getItem('user')).admin ? <Menu.Item key="operation3">admin<Link to="/user/admin" /></Menu.Item> : null}
                    </SubMenu>
                    <SubMenu key="seeting" icon={<SettingOutlined />} title="Settings">
                      <Menu.Item key="setting1">setting1<Link to="/user/main" /></Menu.Item>
                      <Menu.Item key="setting2">setting2<Link to="/user/main" /></Menu.Item>
                    </SubMenu>
                  </Menu>
                </Sider>
                <Layout style={{ padding: '0 24px 24px' }}>
                  <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                    <Route path="/user/main" component={UserMainPage} />
                    <Route path="/user/pending" component={PendingReport} />
                    {JSON.parse(localStorage.getItem('user')).admin ? <Route path="/user/admin" component={Authorization} /> : null}
                  </Content>
                </Layout>
              </Layout>
            </Layout>
          </Router>
        </LoginContextProvider>
      );
    }
  }
}

export default AdminPage;
