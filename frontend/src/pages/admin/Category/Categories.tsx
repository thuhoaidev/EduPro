import React, { useState } from 'react';
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
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
// import { Link } from 'react-router-dom';

// Import CKEditor 5 React Component và Classic Build
import { CKEditor } from '@ckeditor/ckeditor5-react'; // Bỏ import CKEditorProps
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const { Option } = Select;

interface LearningPath {
  key: string;
  name: string;
  courses: number;
  updatedAt: string;
  description: string;
}

const LearningPathTable = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingLearningPath, setEditingLearningPath] = useState<LearningPath | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [form] = Form.useForm();

  const [data, setData] = useState<LearningPath[]>([
    {
      key: '1',
      name: 'Phát triển Web Frontend',
      courses: 5,
      updatedAt: '24/05/2025',
      description: '<p>Đây là mô tả <strong>chi tiết</strong> cho lộ trình phát triển web frontend. Bao gồm HTML, CSS, JavaScript và React.</p>',
    },
    {
      key: '2',
      name: 'Thiết kế API Backend',
      courses: 3,
      updatedAt: '22/05/2025',
      description: '<p>Mô tả về thiết kế API backend, sử dụng Node.js, Express và cơ sở dữ liệu MongoDB.</p>',
    },
    {
      key: '3',
      name: 'Lộ trình Nghề nghiệp Fullstack',
      courses: 8,
      updatedAt: '20/05/2025',
      description: '<p>Lộ trình <em>toàn diện</em> cho phát triển fullstack, kết hợp kiến thức frontend và backend.</p>',
    },
    // ... (các dữ liệu mẫu khác giữ nguyên)
    {
      key: '4',
      name: 'Phát triển ứng dụng di động',
      courses: 6,
      updatedAt: '18/05/2025',
      description: '<p>Học cách xây dựng ứng dụng di động với React Native và Swift/Kotlin.</p>',
    },
    {
      key: '5',
      name: 'Cơ bản về Thiết kế UI/UX',
      courses: 4,
      updatedAt: '15/05/2025',
      description: '<p>Tìm hiểu các nguyên tắc cơ bản của thiết kế giao diện người dùng và trải nghiệm người dùng.</p>',
    },
    {
      key: '6',
      name: 'Khoa học dữ liệu với Python',
      courses: 7,
      updatedAt: '12/05/2025',
      description: '<p>Khóa học về khoa học dữ liệu, phân tích dữ liệu và machine learning với Python.</p>',
    },
    {
      key: '7',
      name: 'Cơ bản về Điện toán Đám mây',
      courses: 2,
      updatedAt: '10/05/2025',
      description: '<p>Giới thiệu về các khái niệm và dịch vụ cơ bản của điện toán đám mây.</p>',
    },
  ]);

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const showAddModal = () => {
    setEditingLearningPath(null);
    setEditorContent('');
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record: LearningPath) => {
    setEditingLearningPath(record);
    setEditorContent(record.description || '');
    form.setFieldsValue({
      title: record.name,
    });
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        const newOrUpdatedData: LearningPath = {
          key: editingLearningPath ? editingLearningPath.key : String(data.length + 1 + Math.random()),
          name: values.title,
          courses: editingLearningPath ? editingLearningPath.courses : 0,
          updatedAt: new Date().toLocaleDateString('vi-VN'),
          description: editorContent,
        };

        if (editingLearningPath) {
          setData(
            data.map((item) =>
              item.key === newOrUpdatedData.key ? newOrUpdatedData : item
            )
          );
        } else {
          setData([...data, newOrUpdatedData]);
        }
        setIsModalVisible(false);
        setEditingLearningPath(null);
        setEditorContent('');
        form.resetFields();
      })
      .catch((info) => {
        console.log('Xác thực thất bại:', info);
      });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingLearningPath(null);
    setEditorContent('');
    form.resetFields();
  };

  const handleDelete = (key: string) => {
    setData(data.filter(item => item.key !== key));
  };

  return (
    <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm tw-min-h-screen">
      {/* Header, Search, Table, Pagination */}
      {/* ... (Phần JSX khác giữ nguyên) ... */}
      <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-justify-between tw-items-start sm:tw-items-center tw-gap-2 tw-mb-4">
        <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800">Danh mục lộ trình học</h2>
        <Button
          type="default"
          className="tw-font-medium tw-border-blue-300 tw-text-blue-600 hover:tw-text-blue-700 hover:tw-border-blue-400 tw-h-10 tw-px-6 tw-rounded-md"
          icon={<PlusOutlined />}
          onClick={showAddModal}
        >
          Tạo Lộ Trình Học
        </Button>
      </div>

      <div className="tw-mb-6">
        <Input
          placeholder="Tìm kiếm danh mục..."
          prefix={<SearchOutlined className="tw-text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="tw-w-full sm:tw-w-80 tw-rounded-md tw-border tw-border-gray-300 tw-py-2 tw-px-4 focus:tw-border-blue-500 focus:tw-ring-0 tw-shadow-none"
          style={{ height: '40px' }}
        />
      </div>

      <Table
        rowClassName={() => 'tw-h-16 hover:tw-bg-gray-100'}
        columns={[
          {
            title: <span className="tw-font-bold tw-text-gray-700">Tên danh mục</span>,
            dataIndex: 'name',
            key: 'name',
            onCell: () => ({ className: 'tw-font-medium' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Số khóa học</span>,
            dataIndex: 'courses',
            key: 'courses',
            align: 'center',
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Ngày cập nhật</span>,
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            align: 'center',
            onCell: () => ({ className: 'tw-text-center' }),
          },
          {
            title: <span className="tw-font-bold tw-text-gray-700">Hành động</span>,
            key: 'action',
            align: 'right',
            render: (_, record: LearningPath) => (
              <Space size="middle">
                <Button
                  icon={<EyeOutlined />}
                  type="link"
                  className="tw-text-blue-500 hover:tw-text-blue-700 tw-text-lg tw-p-1"
                  onClick={() => console.log('Xem chi tiết:', record)}
                />
                <Button
                  icon={<EditOutlined />}
                  type="link"
                  className="tw-text-blue-500 hover:tw-text-blue-700 tw-text-lg tw-p-1"
                  onClick={() => showEditModal(record)}
                />
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa?"
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => handleDelete(record.key)}
                >
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    type="link"
                    className="tw-text-red-500 hover:tw-text-red-700 tw-text-lg tw-p-1"
                  />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        dataSource={currentData}
        pagination={false}
        className="tw-border tw-border-gray-200 tw-rounded-lg"
      />

      <div className="tw-flex tw-justify-end tw-items-center tw-p-4 tw-bg-white tw-border-t tw-border-gray-200">
        <div className="tw-flex tw-items-center tw-space-x-2 tw-mr-4">
          <span className="tw-text-sm tw-text-gray-700">Số dòng trên trang:</span>
          <Select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            size="small"
            className="tw-w-16"
          >
            <Option value={5}>5</Option>
            <Option value={10}>10</Option>
            <Option value={20}>20</Option>
          </Select>
        </div>
        <div className="tw-flex tw-items-center tw-space-x-10">
          <Pagination
            current={currentPage}
            pageSize={rowsPerPage}
            total={filteredData.length}
            onChange={handlePageChange}
            showSizeChanger={false}
            simple
            className="custom-pagination"
          />
        </div>
      </div>

      <Modal
        title={<span className="tw-font-bold tw-text-lg">{editingLearningPath ? 'Chỉnh sửa Lộ trình học' : 'Thêm Lộ trình học'}</span>}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        footer={[
          <Button key="back" onClick={handleModalCancel} className="tw-px-4 tw-py-2 tw-rounded-md tw-text-gray-700 tw-border tw-border-gray-300 hover:tw-bg-gray-50">
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk} className="tw-px-4 tw-py-2 tw-rounded-md tw-bg-blue-500 hover:tw-bg-blue-600 tw-border-none">
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="learning_path_form"
          initialValues={{
            title: editingLearningPath ? editingLearningPath.name : '',
          }}
        >
          <Form.Item
            name="title"
            label={<span className="tw-font-semibold">Tiêu đề</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
            className="tw-mb-4"
          >
            <Input className="tw-rounded-md tw-border tw-border-gray-300 tw-py-2 tw-px-3" />
          </Form.Item>

          <Form.Item label={<span className="tw-font-semibold">Nội dung</span>}>
            <div className="ckeditor-container">
              <CKEditor
                editor={ClassicEditor as any} // <--- SỬA LỖI Ở ĐÂY
                data={editorContent}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setEditorContent(data);
                }}
                config={{
                  toolbar: [
                    'undo', 'redo', '|',
                    'heading', '|',
                    'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', '|',
                    'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                    'alignment', 'numberedList', 'bulletedList', '|',
                    'link', 'uploadImage', 'blockQuote', 'insertTable', 'mediaEmbed', '|',
                    'removeFormat', 'horizontalLine'
                  ]
                }}
              />
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LearningPathTable;