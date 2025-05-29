import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Badge,
  Input,
  Select,
  Pagination,
  Tag,
  Tooltip,
  Modal,
  message,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export interface Course {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  price: number;
  category: string;
  isNew?: boolean;
}

export const getCourses = async (): Promise<Course[]> => {
  return [
    {
      id: "1",
      title: "React Cơ Bản",
      thumbnail: "https://i.imgur.com/xsKJ4Eh.png",
      author: "Nguyễn Văn A",
      price: 0,
      category: "Frontend",
      isNew: true,
    },
    {
      id: "2",
      title: "NodeJS Nâng Cao",
      thumbnail: "https://i.imgur.com/xsKJ4Eh.png",
      author: "Trần Thị B",
      price: 499000,
      category: "Backend",
      isNew: false,
    },
    // ... thêm khóa học khác nếu muốn
  ];
};

const { Meta } = Card;
const { Search } = Input;
const PAGE_SIZE = 4;

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await getCourses();
      setCourses(data);
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (searchTerm) {
      result = result.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType === "free") {
      result = result.filter((course) => course.price === 0);
    } else if (filterType === "paid") {
      result = result.filter((course) => course.price > 0);
    }

    return result;
  }, [courses, searchTerm, filterType]);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, currentPage]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa khóa học này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setCourses((prev) => prev.filter((course) => course.id !== id));
        message.success("Đã xóa khóa học.");
      },
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Bộ lọc */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <Search
          placeholder="Tìm kiếm khóa học..."
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 280 }}
          allowClear
        />
        <Select
          value={filterType}
          onChange={handleFilterChange}
          options={[
            { value: "all", label: "Tất cả" },
            { value: "free", label: "Miễn phí" },
            { value: "paid", label: "Tính phí" },
          ]}
          style={{ width: 160 }}
        />
      </div>

      {/* Danh sách khóa học */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {paginatedCourses.map((course) => (
          <Badge.Ribbon
            key={course.id}
            text={course.isNew ? "Mới" : ""}
            color="red"
          >
            <Card
              hoverable
              cover={
                <div className="relative">
                  <img
                    alt={course.title}
                    src={course.thumbnail}
                    className="h-[180px] w-full object-cover rounded-t-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center text-sm py-1">
                    {course.category}
                  </div>
                </div>
              }
              actions={[
                <Tooltip title="Xem chi tiết" key="view">
                  <EyeOutlined onClick={() => navigate(`/instructor/courses/${course.id}`)} />
                </Tooltip>,
                <Tooltip title="Chỉnh sửa" key="edit">
                  <EditOutlined onClick={() => navigate(`/instructor/courses/${course.id}/edit`)} />
                </Tooltip>,
                <Tooltip title="Xóa" key="delete">
                  <DeleteOutlined onClick={() => handleDelete(course.id)} />
                </Tooltip>,
              ]}
            >
              <Meta
                title={course.title}
                description={
                  <div className="flex justify-between items-center mt-2">
                    <span>
                      {course.price === 0 ? (
                        <Tag color="green">Miễn phí</Tag>
                      ) : (
                        <Tag color="blue">{course.price.toLocaleString()}đ</Tag>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">{course.author}</span>
                  </div>
                }
              />
            </Card>
          </Badge.Ribbon>
        ))}
      </div>

      {/* Phân trang */}
      <div className="text-center mt-4">
        <Pagination
          current={currentPage}
          pageSize={PAGE_SIZE}
          total={filteredCourses.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default CourseList;
