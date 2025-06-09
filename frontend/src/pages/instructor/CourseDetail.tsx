import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VideoLibrary as VideoIcon,
  Quiz as QuizIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';

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

const CourseDetail: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [openChapterDialog, setOpenChapterDialog] = useState(false);
  const [openLessonDialog, setOpenLessonDialog] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [newChapter, setNewChapter] = useState({ title: '' });
  const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '' });

  const handleAddChapter = () => {
    setOpenChapterDialog(true);
  };

  const handleSaveChapter = () => {
    const chapter: Chapter = {
      id: Date.now().toString(),
      title: newChapter.title,
      lessons: [],
    };
    setChapters([...chapters, chapter]);
    setOpenChapterDialog(false);
    setNewChapter({ title: '' });
  };

  const handleAddLesson = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setOpenLessonDialog(true);
  };

  const handleSaveLesson = () => {
    const lesson: Lesson = {
      id: Date.now().toString(),
      title: newLesson.title,
      videoUrl: newLesson.videoUrl,
      quiz: {
        id: Date.now().toString(),
        questions: [],
      },
    };

    setChapters(
      chapters.map((chapter) =>
        chapter.id === selectedChapterId
          ? { ...chapter, lessons: [...chapter.lessons, lesson] }
          : chapter
      )
    );

    setOpenLessonDialog(false);
    setNewLesson({ title: '', videoUrl: '' });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              Chi tiết khóa học
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Quản lý nội dung và bài giảng
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddChapter}
            sx={{
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#0d47a1',
              },
              px: 3,
              py: 1,
            }}
          >
            Thêm chương mới
          </Button>
        </Box>
      </Paper>

      {chapters.map((chapter, index) => (
        <Accordion
          key={chapter.id}
          sx={{
            mb: 2,
            '&:before': {
              display: 'none',
            },
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            borderRadius: '8px !important',
            overflow: 'hidden',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: '#f8f9fa',
              '&:hover': {
                backgroundColor: '#f1f3f5',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <DragIcon sx={{ mr: 2, color: '#666' }} />
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                Chương {index + 1}: {chapter.title}
              </Typography>
              <Chip
                label={`${chapter.lessons.length} bài học`}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List sx={{ width: '100%' }}>
              {chapter.lessons.map((lesson, lessonIndex) => (
                <React.Fragment key={lesson.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      '&:hover': {
                        backgroundColor: '#f8f9fa',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          Bài {lessonIndex + 1}: {lesson.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Chip
                            icon={<VideoIcon />}
                            label="Video bài giảng"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            icon={<QuizIcon />}
                            label="Bài kiểm tra"
                            size="small"
                            color="primary"
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          edge="end"
                          sx={{
                            color: '#1a237e',
                            '&:hover': { backgroundColor: 'rgba(26, 35, 126, 0.1)' },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          edge="end"
                          sx={{
                            color: '#d32f2f',
                            '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {lessonIndex < chapter.lessons.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              <ListItem>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleAddLesson(chapter.id)}
                  sx={{
                    color: '#1a237e',
                    '&:hover': { backgroundColor: 'rgba(26, 35, 126, 0.1)' },
                  }}
                >
                  Thêm bài học mới
                </Button>
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Dialog thêm chương mới */}
      <Dialog
        open={openChapterDialog}
        onClose={() => setOpenChapterDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#1a237e', color: 'white' }}>
          Thêm chương mới
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Tên chương"
            fullWidth
            value={newChapter.title}
            onChange={(e) => setNewChapter({ title: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenChapterDialog(false)}
            sx={{
              color: '#666',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveChapter}
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

      {/* Dialog thêm bài học mới */}
      <Dialog
        open={openLessonDialog}
        onClose={() => setOpenLessonDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#1a237e', color: 'white' }}>
          Thêm bài học mới
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Tên bài học"
            fullWidth
            value={newLesson.title}
            onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="URL video"
            fullWidth
            value={newLesson.videoUrl}
            onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
            helperText="Nhập URL video bài giảng (YouTube, Vimeo, etc.)"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenLessonDialog(false)}
            sx={{
              color: '#666',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveLesson}
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

export default CourseDetail; 