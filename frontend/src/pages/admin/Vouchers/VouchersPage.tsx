import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Pagination,
  Popconfirm,
  Select,
  Modal,
  Form,
  DatePicker,
  InputNumber,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import type { Coupon } from "../../../interfaces/Admin.interface";


const { Option } = Select;


const VouchersPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form] = Form.useForm();
  const [data, setData] = useState<Coupon[]>([]);

  // Danh sách khóa học giả lập dùng trong Select
  const courses = [
    { id: 'all', name: 'Tất cả khóa học' },
    { id: 'course-1', name: 'Khóa học React Nâng cao' },
    { id: 'course-2', name: 'Khóa học Node.js và API' },
    { id: 'course-3', name: 'Khóa học Python cho Data Science' },
    { id: 'course-4', name: 'Khóa học Thiết kế UI/UX cơ bản' },
  ];

  useEffect(() => {
    setData([
      {
        key: '1',
        code: 'GIAM10K',
        courseApplied: 'Tất cả khóa học',
        type: 'amount',
        value: 10000,
        usedCount: 5,
        quantity: 100,
        createdAt: '2025-05-01',
        expiresAt: '2025-06-30',
      },
      {
        key: '2',
        code: 'SALE20',
        courseApplied: 'Khóa học React Nâng cao',
        type: 'percentage',
        value: 20,
        usedCount: 10,
        quantity: 50,
        createdAt: '2025-04-15',
        expiresAt: '2025-05-31',
      },
      // ... thêm các coupon khác như bạn đã có
    ]);
  }, []);

  // Lọc theo tìm kiếm
  const filteredData = data.filter((item) =>
    item.code.toLowerCase().includes(searchText.toLowerCase()) ||
    item.courseApplied.toLowerCase().includes(searchText.toLowerCase())
  );

  // Sắp xếp theo giá trị giảm
  const sortedData = [...filteredData].sort((a, b) =>
    sortOrder === 'asc' ? a.value - b.value : b.value - a.value
  );

  // Phân trang
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const showAddModal = () => {
    setEditingCoupon(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'amount',
      value: 0,
      quantity: 1,
      startDate: dayjs(),
      endDate: null,
      courseId: 'all',
    });
    setIsModalVisible(true);
  };

  const showEditModal = (record: Coupon) => {
    setEditingCoupon(record);
    form.setFieldsValue({
      code: record.code,
      courseId: courses.find(c => c.name === record.courseApplied)?.id || 'all',
      type: record.type,
      value: record.value,
      quantity: record.quantity,
      startDate: dayjs(record.createdAt),
      endDate: record.expiresAt ? dayjs(record.expiresAt) : null,
    });
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields()
      .then(values => {
        const courseName = courses.find(c => c.id === values.courseId)?.name || '';

        const newCoupon: Coupon = {
          key: editingCoupon ? editingCoupon.key : (data.length + 1 + Math.random()).toString(),
          code: values.code,
          courseApplied: courseName,
          type: values.type,
          value: values.value,
          usedCount: editingCoupon ? editingCoupon.usedCount : 0,
          quantity: values.quantity,
          createdAt: editingCoupon ? editingCoupon.createdAt : dayjs().format('YYYY-MM-DD'),
          expiresAt: values.endDate ? values.endDate.format('YYYY-MM-DD') : '',
        };

        if (editingCoupon) {
          setData(data.map(item => item.key === newCoupon.key ? newCoupon : item));
        } else {
          setData([...data, newCoupon]);
        }

        setIsModalVisible(false);
        setEditingCoupon(null);
        form.resetFields();
      })
      .catch(err => {
        console.log('Validate Failed:', err);
      });
  };

  const handleDelete = (key: string) => {
    setData(data.filter(item => item.key !== key));
  };

  return (
    <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm tw-min-h-screen">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
        <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800">Quản lý mã giảm giá</h2>
        <Button
          icon={<PlusOutlined />}
          type="default"
          onClick={showAddModal}
          className="tw-font-medium tw-border-blue-300 tw-text-blue-600 hover:tw-text-blue-700 hover:tw-border-blue-400 tw-h-10 tw-px-6 tw-rounded-md"
        >
          Tạo Mã
        </Button>
      </div>

      <div className="tw-flex tw-gap-4 tw-mb-6">
        <Input
          placeholder="Tìm kiếm mã hoặc khóa học..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="tw-w-full sm:tw-w-80"
          style={{ height: 40 }}
        />
        <Space>
          <span className="tw-text-sm tw-text-gray-700">Sắp xếp theo giá trị giảm:</span>
          <Select
            value={sortOrder}
            onChange={value => setSortOrder(value as 'asc' | 'desc')}
            size="middle"
            className="tw-w-32"
          >
            <Option value="asc">Tăng dần</Option>
            <Option value="desc">Giảm dần</Option>
          </Select>
        </Space>
      </div>

      <Table
        rowClassName={() => 'tw-h-16 hover:tw-bg-gray-100'}
        columns={[
          {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            onCell: () => ({ className: 'tw-font-medium' }),
          },
          {
            title: 'Áp dụng khóa học',
            dataIndex: 'courseApplied',
            key: 'courseApplied',
          },
          {
            title: 'Loại giảm giá',
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            render: (type: 'amount' | 'percentage') =>
              type === 'amount' ? 'Số tiền' : 'Phần trăm',
          },
          {
            title: 'Giá trị giảm',
            dataIndex: 'value',
            key: 'value',
            align: 'center',
            render: (value: number, record: Coupon) =>
              record.type === 'percentage'
                ? `${value}%`
                : `${value.toLocaleString('vi-VN')} VNĐ`,
          },
          {
            title: 'Đã sử dụng',
            dataIndex: 'usedCount',
            key: 'usedCount',
            align: 'center',
          },
          {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
          },
          {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
          },
          {
            title: 'Ngày hết hạn',
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            align: 'center',
            render: (date: string) => (date ? date : 'Không giới hạn'),
          },
          {
            title: 'Hành động',
            key: 'actions',
            align: 'center',
            fixed: 'right',
            width: 140,
            render: (_text, record: Coupon) => (
              <Space size="middle" className="tw-text-lg">
                <Button
                  icon={<EditOutlined />}
                  type="link"
                  onClick={() => showEditModal(record)}
                  className="tw-text-blue-600"
                />
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa mã này?"
                  onConfirm={() => handleDelete(record.key)}
                  okText="Có"
                  cancelText="Hủy"
                >
                  <Button
                    icon={<DeleteOutlined />}
                    type="link"
                    danger
                    className="tw-text-red-600"
                  />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        dataSource={currentData}
        pagination={false}
        scroll={{ x: 1100 }}
      />

      <div className="tw-flex tw-justify-end tw-mt-6">
        <Pagination
          current={currentPage}
          pageSize={rowsPerPage}
          total={sortedData.length}
          onChange={page => setCurrentPage(page)}
          showSizeChanger={false}
          className="tw-text-gray-700"
        />
      </div>

      <Modal
        title={editingCoupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCoupon(null);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'amount',
            value: 0,
            quantity: 1,
            courseId: 'all',
          }}
        >
          <Form.Item
            label="Mã giảm giá"
            name="code"
            rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá' }]}
          >
            <Input placeholder="Nhập mã giảm giá" maxLength={20} />
          </Form.Item>

          <Form.Item label="Khóa học áp dụng" name="courseId" rules={[{ required: true }]}>
            <Select>
              {courses.map(c => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Loại giảm giá" name="type" rules={[{ required: true }]}>
            <Select>
              <Option value="amount">Số tiền (VNĐ)</Option>
              <Option value="percentage">Phần trăm (%)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá trị giảm"
            name="value"
            rules={[
              { required: true, message: 'Vui lòng nhập giá trị giảm' },
              { type: 'number', min: 1, message: 'Giá trị phải lớn hơn 0' },
            ]}
          >
        <InputNumber<number>
                style={{ width: '100%' }}
                min={1}
                placeholder="Nhập giá trị giảm"
                formatter={(value) => {
                if (!value) return '';
                const type = form.getFieldValue('type');
                return type === 'percentage' ? `${value}%` : `${value} VNĐ`;
             }}
             parser={(value) => {
               if (!value) return 0;
               return Number(value.replace('%', '').replace(' VNĐ', ''));
            }}
/>
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="Nhập số lượng" />
          </Form.Item>

          <Form.Item label="Ngày tạo" name="startDate" rules={[{ required: true }]}>
            <DatePicker
              style={{ width: '100%' }}
              disabled
              format="YYYY-MM-DD"
              placeholder="Ngày tạo"
            />
          </Form.Item>

          <Form.Item label="Ngày hết hạn" name="endDate">
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Chọn ngày hết hạn (Không bắt buộc)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VouchersPage;
