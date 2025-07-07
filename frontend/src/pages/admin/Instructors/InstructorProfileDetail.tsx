import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
      Card,
      Descriptions,
      Divider,
      Typography,
      Spin,
      List,
      Avatar,
      Row,
      Col,
} from "antd";
import { config } from "../../../api/axios";

const { Title, Text } = Typography;

const PendingInstructorDetail = () => {
      const { id } = useParams();
      const [instructor, setInstructor] = useState<any>(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            const fetchDetail = async () => {
                  try {
                        const res = await config.get(`/users/instructors/pending/${id}`);
                        setInstructor(res.data.data);
                  } catch (error) {
                        console.error("Lỗi khi tải chi tiết giảng viên:", error);
                  } finally {
                        setLoading(false);
                  }
            };

            if (id) fetchDetail();
      }, [id]);

      if (loading || !instructor) return (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin size="large" className="block mx-auto mt-20">
                        <div style={{ padding: '50px 0' }}>
                              <div>Đang tải...</div>
                        </div>
                  </Spin>
            </div>
      );

      const {
            fullname,
            email,
            nickname,
            avatar,
            gender,
            dob,
            instructorProfile,
      } = instructor;

      const profile = instructorProfile || {};
      const instructorInfo = profile.instructorInfo || {};
      const teachingExperience = instructorInfo.teaching_experience || {};
      const certificates = instructorInfo.certificates || [];
      const otherDocuments = instructorInfo.other_documents || [];

      return (
            <div className="p-6 max-w-5xl mx-auto">
                  <Card variant="borderless" className="shadow">
                        <Row gutter={[24, 24]}>
                              <Col xs={24} md={6}>
                                    <Avatar
                                          size={120}
                                          src={avatar}
                                          alt="avatar"
                                          className="border border-gray-200 shadow-sm"
                                    />
                              </Col>
                              <Col xs={24} md={18}>
                                    <Title level={3}>👨‍🏫 Hồ sơ giảng viên: {fullname}</Title>
                                    <Text type="secondary">{email}</Text>
                              </Col>
                        </Row>

                        <Divider />

                        <Descriptions bordered column={2} size="middle">
                              <Descriptions.Item label="Tên đăng nhập">{nickname}</Descriptions.Item>
                              <Descriptions.Item label="Giới tính">{gender || "Chưa cập nhật"}</Descriptions.Item>
                              <Descriptions.Item label="Ngày sinh">
                                    {dob ? new Date(dob).toLocaleDateString() : "Chưa cập nhật"}
                              </Descriptions.Item>
                              <Descriptions.Item label="Số điện thoại">{profile.phone || "Chưa cập nhật"}</Descriptions.Item>
                              <Descriptions.Item label="Địa chỉ">{profile.address || "Chưa cập nhật"}</Descriptions.Item>
                              <Descriptions.Item label="Chuyên môn">
                                    {(instructorInfo.specializations || []).join(", ") || "Chưa cập nhật"}
                              </Descriptions.Item>
                              <Descriptions.Item label="Số năm kinh nghiệm">
                                    {instructorInfo.experience_years || 0} năm
                              </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">🧑‍🏫 Kinh nghiệm giảng dạy</Divider>
                        <p>
                              <strong>Số năm:</strong> {teachingExperience.years || 0} năm
                        </p>
                        <p>
                              <strong>Mô tả:</strong> {teachingExperience.description || "Không có mô tả"}
                        </p>

                        <Divider orientation="left">📜 Bằng cấp & chứng chỉ</Divider>
                        {certificates.length === 0 ? (
                              <Text type="secondary">Không có bằng cấp</Text>
                        ) : (
                              <List
                                    bordered
                                    dataSource={certificates}
                                    renderItem={(item: any, index: number) => (
                                          <List.Item key={index}>
                                                <List.Item.Meta
                                                      title={`${item.name} (${item.year})`}
                                                      description={
                                                            <>
                                                                  <div><strong>Ngành:</strong> {item.major}</div>
                                                                  <div><strong>Nơi cấp:</strong> {item.issuer}</div>
                                                            </>
                                                      }
                                                />
                                                {item.file && (
                                                      <a href={item.file} target="_blank" rel="noopener noreferrer">
                                                            Xem file
                                                      </a>
                                                )}
                                          </List.Item>
                                    )}
                              />
                        )}

                        <Divider orientation="left">📄 CV</Divider>
                        {instructorInfo.cv_file ? (
                              <a href={instructorInfo.cv_file} target="_blank" rel="noopener noreferrer">
                                    Xem CV
                              </a>
                        ) : (
                              <Text type="secondary">Không có CV</Text>
                        )}

                        <Divider orientation="left">🎥 Video Demo</Divider>
                        {instructorInfo.demo_video ? (
                              <video controls width="100%" style={{ maxWidth: 600 }}>
                                    <source src={instructorInfo.demo_video} />
                                    Trình duyệt của bạn không hỗ trợ video.
                              </video>
                        ) : (
                              <Text type="secondary">Không có video demo</Text>
                        )}

                        <Divider orientation="left">📁 Tài liệu khác</Divider>
                        {otherDocuments.length === 0 ? (
                              <Text type="secondary">Không có tài liệu khác</Text>
                        ) : (
                              <List
                                    bordered
                                    dataSource={otherDocuments}
                                    renderItem={(doc: any, index: number) => (
                                          <List.Item key={index}>
                                                <div>
                                                      <strong>{doc.name}</strong>
                                                      <div>{doc.description || "Không có mô tả"}</div>
                                                </div>
                                                {doc.file && (
                                                      <a href={doc.file} target="_blank" rel="noopener noreferrer">
                                                            Xem file
                                                      </a>
                                                )}
                                          </List.Item>
                                    )}
                              />
                        )}
                  </Card>
            </div>
      );
};

export default PendingInstructorDetail;
