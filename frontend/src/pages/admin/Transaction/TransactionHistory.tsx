import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Button,
  Select,
  Dropdown,
  Menu,
  Pagination,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

interface Transaction {
  key: string;
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  courseName: string;
  transactionDate: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
}

const TransactionHistory = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [ordersRaw, setOrdersRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        // Lấy role mới nhất từ localStorage mỗi lần fetch
        const userRole = localStorage.getItem('role');
        // Debug log
        console.log('TransactionHistory userRole:', userRole);
        const endpoint = userRole === 'admin'
          ? 'http://localhost:5000/api/orders/all?page=1&pageSize=100'
          : 'http://localhost:5000/api/orders?page=1&pageSize=100';
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const orders = res.data.data?.orders || res.data.orders || res.data.data || [];
        setOrdersRaw(orders);

        const formatted = orders.map((order: any, idx: number): Transaction => ({
          key: (order._id || order.id || '') + '_' + idx,
          orderId: order._id || order.id || '',
          buyerName: order.fullName,
          buyerEmail: order.email,
          courseName: (order.items || []).map((i: any) => i.courseId?.title || 'Không rõ').join(', '),
          transactionDate: dayjs(order.createdAt).format('HH:mm DD/MM/YYYY'),
          status: order.paymentStatus === 'paid' ? 'Đã thanh toán' :
                  order.paymentStatus === 'pending' ? 'Chưa thanh toán' : order.paymentStatus,
          paymentMethod: order.paymentMethod || '',
          totalAmount: order.totalAmount || 0,
        }));

        setData(formatted);
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [/* không có dependency để luôn lấy role mới nhất mỗi lần render */]);

  const filteredData = data
    .filter(item => item.orderId.toLowerCase().includes(searchText.toLowerCase()))
    .filter(item => (minAmount === null || item.totalAmount >= minAmount))
    .filter(item => (maxAmount === null || item.totalAmount <= maxAmount));

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === 'asc') return a.totalAmount - b.totalAmount;
    if (sortOrder === 'desc') return b.totalAmount - a.totalAmount;
    return 0;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleShowDetail = (id: string) => {
    const order = ordersRaw.find(o => o._id === id || o.id === id);
    setSelectedOrder(order || null);
    setModalVisible(true);
  };

  const sortMenu = (
    <Menu onClick={({ key }) => setSortOrder(key as 'asc' | 'desc')}>
      <Menu.Item key="asc">Giá tăng dần</Menu.Item>
      <Menu.Item key="desc">Giá giảm dần</Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'ID Đơn Hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      className: 'tw-font-medium',
    },
    {
      title: 'Người Mua',
      key: 'buyer',
      render: (_: any, record: Transaction) => (
        <div>
          <div className="tw-font-medium">{record.buyerName}</div>
          <div className="tw-text-sm tw-text-gray-500">{record.buyerEmail}</div>
        </div>
      ),
    },
    {
      title: 'Ngày Mua',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      align: 'center' as const,
    },
    {
      title: 'Phương Thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      align: 'center' as const,
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (amount: number) => (
        <span className="tw-font-semibold">{amount.toLocaleString('vi-VN')} đ</span>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: Transaction) => (
        <Button type="link" onClick={() => handleShowDetail(record.orderId)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm">
      <h2 className="tw-text-2xl tw-font-bold tw-mb-4">Lịch sử giao dịch</h2>

      <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-4 tw-mb-6">
        <Input
          placeholder="Tìm ID đơn hàng"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="tw-w-60"
        />
        <Input
          placeholder="Giá tối thiểu"
          type="number"
          value={minAmount ?? ''}
          onChange={e => setMinAmount(e.target.value ? +e.target.value : null)}
          className="tw-w-40"
        />
        <Input
          placeholder="Giá tối đa"
          type="number"
          value={maxAmount ?? ''}
          onChange={e => setMaxAmount(e.target.value ? +e.target.value : null)}
          className="tw-w-40"
        />
        <Dropdown overlay={sortMenu}>
          <Button>
            Sắp xếp giá: {sortOrder === 'asc' ? 'Tăng' : sortOrder === 'desc' ? 'Giảm' : 'Không'}{' '}
            <CaretDownOutlined />
          </Button>
        </Dropdown>
      </div>

      <Table
        columns={columns}
        dataSource={currentData}
        loading={loading}
        pagination={false}
        rowClassName="tw-h-16"
        locale={{ emptyText: 'Không có giao dịch phù hợp.' }}
      />

      <div className="tw-flex tw-justify-end tw-items-center tw-mt-4 tw-gap-4">
        <span>Rows:</span>
        <Select value={rowsPerPage} onChange={setRowsPerPage} size="small" style={{ width: 80 }}>
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
          </Select>
          <Pagination
            current={currentPage}
            pageSize={rowsPerPage}
            total={filteredData.length}
          onChange={setCurrentPage}
            showSizeChanger={false}
            simple
          />
      </div>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        title="Chi tiết đơn hàng"
        width={800}
      >
        {selectedOrder && (
          <div>
            <div className="tw-mb-4">
              <b>Mã đơn:</b> {selectedOrder._id || selectedOrder.id} <br />
              <b>Phương thức:</b> {selectedOrder.paymentMethod?.toUpperCase()} <br />
              <b>Ngày đặt:</b> {dayjs(selectedOrder.createdAt).format('HH:mm DD/MM/YYYY')}
            </div>
            <b>Thông tin người mua:</b>
            <div>Họ tên: {selectedOrder.fullName}</div>
            <div>SĐT: {selectedOrder.phone}</div>
            <div>Email: {selectedOrder.email}</div>

            <hr className="tw-my-4" />
            <b>Chi tiết sản phẩm:</b>
            {(selectedOrder.items || []).map((item: any) => (
              <div
                key={item._id}
                className="tw-flex tw-items-center tw-my-2 tw-bg-gray-50 tw-p-2 tw-rounded"
              >
                <img
                  src={item.courseId?.thumbnail || '/default-course.png'}
                  alt={item.courseId?.title}
                  className="tw-w-14 tw-h-14 tw-rounded tw-object-cover tw-mr-4"
                />
                <div className="tw-flex-1">
                  <div className="tw-font-medium">{item.courseId?.title}</div>
                  <div className="tw-text-gray-500 tw-text-sm">Số lượng: {item.quantity || 1}</div>
                </div>
                <div className="tw-font-semibold tw-min-w-[100px] tw-text-right">
                  {item.price?.toLocaleString('vi-VN')} đ
                </div>
              </div>
            ))}
            <div className="tw-text-right tw-font-bold tw-text-lg tw-mt-4">
              Tổng tiền: {selectedOrder.totalAmount?.toLocaleString('vi-VN')} đ
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransactionHistory;
