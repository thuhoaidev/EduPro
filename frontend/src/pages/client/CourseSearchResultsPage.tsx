import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Typography, Spin, Empty, Pagination } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { courseService } from '../../services/apiService';
import CategoryNav from '../../components/common/CategoryNav';
import CourseCard from '../../components/course/CourseCard';
import type { Course } from '../../services/apiService';

const { Content } = Layout;
const { Title } = Typography;

const CourseSearchResultsPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const coursesPerPage = 8;
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let fetchedCourses: Course[] = [];
      let totalCourses = 0;
      
      if (searchTerm) {
        fetchedCourses = await courseService.searchCourses(searchTerm);
        totalCourses = fetchedCourses.length;
      } else {
        fetchedCourses = await courseService.getAllCourses();
        totalCourses = fetchedCourses.length;
      }
      
      setCourses(fetchedCourses);
      setTotal(totalCourses);
    } catch {
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, [searchTerm, currentPage]);

  return (
    <Content className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Title level={2} className="mb-6">
          {searchTerm ? `Kết quả tìm kiếm cho "${searchTerm}"` : 'Tất cả khóa học'}
        </Title>
        
        <CategoryNav />
        
        {loading ? (
          <div className="text-center py-16"><Spin size="large" /></div>
        ) : courses.length > 0 ? (
          <Row gutter={[24, 24]} className="mt-4">
            {courses.map(course => (
              <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
                <CourseCard course={course} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty 
            description={
              searchTerm 
                ? `Không tìm thấy khóa học nào phù hợp với "${searchTerm}"`
                : "Không có khóa học nào"
            } 
            className="my-16" 
          />
        )}
        
        {total > coursesPerPage && (
          <div className="flex justify-center mt-10">
            <Pagination
              current={currentPage}
              total={total}
              pageSize={coursesPerPage}
              onChange={page => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </Content>
  );
};

export default CourseSearchResultsPage; 