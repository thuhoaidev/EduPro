import React, { useEffect, useState } from "react";
import {
      Table,
      Button,
      Modal,
      Form,
      Input,
      Space,
      Popconfirm,
      message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { config } from "../../../api/axios";

interface Category {
      _id: string;
      name: string;
      description?: string;
}

const CategoryManagement = () => {
      const [categories, setCategories] = useState<Category[]>([]);
      const [loading, setLoading] = useState(false);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [editingCategory, setEditingCategory] = useState<Category | null>(null);
      const [form] = Form.useForm();

      const fetchCategories = async () => {
            setLoading(true);
            try {
                  const res = await config.get("/admin/categories");
                  setCategories(res.data.data || []);
            } catch (err) {
                  message.error("Lỗi khi tải danh mục");
            }
            setLoading(false);
      };

      useEffect(() => {
            fetchCategories();
      }, []);

      const handleAdd = () => {
            setEditingCategory(null);
            form.resetFields();
            setIsModalOpen(true);
      };

      const handleEdit = (category: Category) => {
            setEditingCategory(category);
            form.setFieldsValue(category);
            setIsModalOpen(true);
      };

      const handleDelete = async (id: string) => {
            try {
                  await config.delete(`/admin/categories/${id}`);
                  message.success("Xóa danh mục thành công");
                  fetchCategories();
            } catch (err) {
                  message.error("Lỗi khi xóa danh mục");
            }
      };

      const handleModalOk = async () => {
            try {
                  const values = await form.validateFields();
                  if (editingCategory) {
                        await config.put(`/admin/categories/${editingCategory._id}`, values);
                        message.success("Cập nhật danh mục thành công");
                  } else {
                        await config.post("/admin/categories", values);
                        message.success("Thêm danh mục thành công");
                  }
                  fetchCategories();
                  setIsModalOpen(false);
            } catch (err) {
                  message.error("Lỗi khi lưu danh mục");
            }
      };

      const columns = [
            {
                  title: "Tên danh mục",
                  dataIndex: "name",
                  key: "name",
            },
            {
                  title: "Mô tả",
                  dataIndex: "description",
                  key: "description",
            },
            {
                  title: "Hành động",
                  key: "action",
                  render: (_: any, record: Category) => (
                        <Space>
                              <Button type="link" onClick={() => handleEdit(record)}>
                                    Sửa
                              </Button>
                              <Popconfirm
                                    title="Bạn chắc chắn muốn xóa?"
                                    onConfirm={() => handleDelete(record._id)}
                              >
                                    <Button type="link" danger>
                                          Xóa
                                    </Button>
                              </Popconfirm>
                        </Space>
                  ),
            },
      ];

      return (
            <div>
                  <h2>Quản lý danh mục</h2>
                  <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginBottom: 16 }}
                        onClick={handleAdd}
                  >
                        Thêm danh mục
                  </Button>

                  <Table
                        dataSource={categories}
                        columns={columns}
                        rowKey="_id"
                        loading={loading}
                  />

                  <Modal
                        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
                        open={isModalOpen}
                        onOk={handleModalOk}
                        onCancel={() => setIsModalOpen(false)}
                        okText="Lưu"
                        cancelText="Hủy"
                  >
                        <Form form={form} layout="vertical">
                              <Form.Item
                                    label="Tên danh mục"
                                    name="name"
                                    rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
                              >
                                    <Input />
                              </Form.Item>
                              <Form.Item label="Mô tả" name="description">
                                    <Input.TextArea />
                              </Form.Item>
                        </Form>
                  </Modal>
            </div>
      );
};

export default CategoryManagement;
