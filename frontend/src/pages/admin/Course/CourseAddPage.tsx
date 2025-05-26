import {
  Form,
  Input,
  Tabs,
  Upload,
  Button,
  message,
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import CourseSettingsTab from './CourseSettingsTab'; // tab Cài Đặt đã viết ở trên

const { TabPane } = Tabs;

const CourseAddPage = () => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    console.log('Submitted values:', values);
    message.success('Tạo khóa học thành công!');
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Khóa học mới</h2>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          type: 'free',
          certificate: 'no',
          visibility: 'private',
          level: 'easy',
        }}
      >
        {/* Tiêu đề khóa học */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
          <Form.Item
            name="title"
            className="flex-1"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề khóa học' }]}
          >
            <Input size="large" placeholder="Tiêu đề khóa học" />
          </Form.Item>

          {/* Ảnh thumbnail */}
          <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl p-6 min-w-[200px] h-[120px]">
            <Upload
              name="thumbnail"
              listType="picture-card"
              maxCount={1}
              showUploadList={false}
              beforeUpload={() => false} // Giữ file tạm thời
            >
              <div className="flex flex-col items-center text-center text-gray-500 text-sm">
                <PlusOutlined className="text-xl mb-1" />
                Chọn Từ Kho Lưu Trữ
              </div>
            </Upload>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultActiveKey="1">
          <TabPane tab="Chương Học" key="1">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 italic">Chức năng thêm chương sẽ được code riêng.</p>
            </div>
          </TabPane>

          <TabPane tab="Mô Tả" key="2">
            <Form.Item name="description" label="Mô tả khóa học">
              <Input.TextArea rows={5} placeholder="Nhập mô tả khóa học..." />
            </Form.Item>
          </TabPane>

          <TabPane tab="Cài Đặt" key="3">
            <CourseSettingsTab />
          </TabPane>
        </Tabs>

        {/* Nút Lưu */}
        <div className="mt-6 text-right">
          <Button type="primary" htmlType="submit">
            Lưu
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CourseAddPage;
