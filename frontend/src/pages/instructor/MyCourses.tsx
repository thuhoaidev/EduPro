import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Chip,
  Avatar,
  CardMedia,
  CardActionArea,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';

interface Course {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  thumbnail?: string;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  quiz: Quiz;
}

interface Quiz {
  id: string;
  questions: Question[];
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', thumbnail: '' });

  const handleAddCourse = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCourse({ title: '', description: '', thumbnail: '' });
  };

  const handleSaveCourse = () => {
    const course: Course = {
      id: Date.now().toString(),
      title: newCourse.title,
      description: newCourse.description,
      thumbnail: newCourse.thumbnail || 'https://source.unsplash.com/random/800x600/?education',
      chapters: [],
    };
    setCourses([...courses, course]);
    handleCloseDialog();
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              Khóa học của tôi
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Quản lý và tổ chức nội dung khóa học của bạn
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCourse}
            sx={{
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#0d47a1',
              },
              px: 3,
              py: 1,
            }}
          >
            Thêm khóa học mới
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="200"
                  image={course.thumbnail}
                  alt={course.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    paragraph
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {course.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Chip
                      icon={<MenuBookIcon />}
                      label={`${course.chapters.length} chương`}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      icon={<SchoolIcon />}
                      label="Đang hoạt động"
                      size="small"
                      color="success"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <IconButton
                      size="small"
                      sx={{
                        color: '#1a237e',
                        '&:hover': { backgroundColor: 'rgba(26, 35, 126, 0.1)' },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{
                        color: '#d32f2f',
                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#1a237e', color: 'white' }}>
          Thêm khóa học mới
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Tên khóa học"
            fullWidth
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Mô tả"
            fullWidth
            multiline
            rows={4}
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="URL ảnh bìa"
            fullWidth
            value={newCourse.thumbnail}
            onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
            helperText="Để trống để sử dụng ảnh mặc định"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: '#666',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveCourse}
            variant="contained"
            sx={{
              backgroundColor: '#1a237e',
              '&:hover': { backgroundColor: '#0d47a1' },
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCourses; 