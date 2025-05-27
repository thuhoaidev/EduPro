
import { Content, Header } from "antd/es/layout/layout";
import React from 'react';
import { Layout, Input, Space, Button, Avatar, Dropdown, Menu, Breadcrumb } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

import ftechcLogo from '../../assets/ftech-c.png'; // Đường dẫn đã được xác nhận
import { Outlet } from "react-router-dom";

const AuthLayout = () => {

      return (
            <div>
                  <Header style={{
                        background: '#fff',
                        // padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #f0f0f0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        marginBottom: 0

                  }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                              {/* Logo */}
                              <img src={ftechcLogo} alt="Logo" style={{
                                    height: 38,
                                    width: 38,
                                    marginRight: 8,
                                    borderRadius: 8, // Square with rounded corners
                                    objectFit: 'cover'
                              }} />
                        </div>
                        <Button type="link" style={{ color: '#000', fontSize: '1.2em', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                              Lập trình Frech
                        </Button>
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', marginLeft: 24, marginRight: 24 }}>
                              <Input
                                    placeholder="Tìm kiếm khóa học"
                                    prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
                                    style={{
                                          width: '50%',
                                          borderRadius: 25, // More rounded corners for input
                                          padding: '8px 12px',
                                          border: '1px solid #d9d9d9', // Default border
                                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                    }}

                                    onFocus={(e) => {
                                          e.target.style.borderColor = '#1890ff';
                                          e.target.style.boxShadow = '0 0 0 2px rgba(24,144,255,0.2)';
                                    }}
                                    onBlur={(e) => {
                                          e.target.style.borderColor = '#d9d9d9';
                                          e.target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                                    }}
                              />
                        </div>
                        {/* Right Section: Icons and Avatar */}
                        <Space size="middle" style={{ alignItems: 'center' }}>
                              {/* Bell Icon */}
                              <Button
                                    type="text"
                                    icon={<BellOutlined style={{ fontSize: '1.4em', color: '#888' }} />}
                                    style={{
                                          width: 40, height: 40, borderRadius: '50%',
                                          backgroundColor: '#f0f2f5',
                                          border: '1px solid #d9d9d9',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                    }}
                              />
                              <Avatar
                                    icon={<UserOutlined />}
                                    style={{
                                          backgroundColor: '#e0e0e0',
                                          color: '#888',
                                          cursor: 'pointer',
                                          height: 40, width: 40,
                                          borderRadius: '50%',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          border: '1px solid #d9d9d9',
                                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                    }}
                              />
                        </Space>
                  </Header>

                  <main style={{
                        minHeight: "auto",
                        padding: "8px 12px",
                        marginTop: 0,
                        marginBottom: 0,
                  }}>
                        <Outlet />
                  </main>

                  <footer className="bg-[#212529] text-white py-3 px-6 w-full">
                        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                              {/* Cột 1 */}
                              <div>
                                    <h4 className="text-xl font-semibold mb-4">Liên hệ với chúng tôi</h4>
                                    <p className="text-gray-400">+0123456789</p>
                                    <p className="text-gray-400">email.com</p>
                                    <p className="text-gray-400">9AM - 5PM, Monday - Friday</p>
                                    <p className="text-gray-400">Nhà số 10, 379 Xuân Phương, Nam Từ Liêm, Hà Nội</p>
                              </div>

                              {/* Cột 2 */}
                              <div>
                                    <h4 className="text-xl font-semibold mb-4">Các liên kết khác</h4>
                                    <ul className="space-y-2">
                                          <li><a href="#" className="text-gray-400 hover:text-white">Start here</a></li>
                                          <li><a href="#" className="text-gray-400 hover:text-white">Blogs</a></li>
                                          <li><a href="#" className="text-gray-400 hover:text-white">About us</a></li>
                                          <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                                          <li><a href="#" className="text-gray-400 hover:text-white">Career</a></li>
                                          <li><a href="#" className="text-gray-400 hover:text-white">Courses</a></li>
                                    </ul>
                              </div>

                              {/* Cột 3 */}
                              <div>
                                    <h4 className="text-xl font-semibold mb-4">Sản phẩm</h4>
                                    <ul className="space-y-2">
                                          <li><a href="#" className="text-gray-400 hover:text-white">Start here</a></li>
                                          <li><a href="#" className="text-gray-400 hover:text-white">Blogs</a></li>
                                          <li><a href="#" className="text-gray-400 hover:text-white">About us</a></li>
                                          <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                                          <li><a href="#" className="text-gray-400 hover:text-white">Career</a></li>
                                          <li><a href="#" className="text-gray-400 hover:text-white">Courses</a></li>
                                    </ul>
                              </div>

                              {/* Cột 4 */}
                              <div>
                                    <h4 className="text-xl font-semibold mb-4">Mạng xã hội</h4>
                                    <p className="text-gray-400">
                                          Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut odit magniem officiis sequi laudae corporis dolorem beatae? Dolore parahur illo odio nulla atque quibusdam ut voluptate ut sumus, suscipit est.
                                    </p>
                              </div>
                        </div>
                  </footer>
            </div>
      );
}

export default AuthLayout;
