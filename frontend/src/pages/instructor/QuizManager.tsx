import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Chip,
  Divider,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  questions: Question[];
}

const QuizManager: React.FC = () => {
  const [quiz, setQuiz] = useState<Quiz>({
    id: '1',
    questions: [],
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    });
    setOpenDialog(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestion({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
    });
    setOpenDialog(true);
  };

  const handleSaveQuestion = () => {
    if (editingQuestion) {
      setQuiz({
        ...quiz,
        questions: quiz.questions.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                question: newQuestion.question,
                options: newQuestion.options,
                correctAnswer: newQuestion.correctAnswer,
              }
            : q
        ),
      });
    } else {
      const question: Question = {
        id: Date.now().toString(),
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer,
      };
      setQuiz({
        ...quiz,
        questions: [...quiz.questions, question],
      });
    }
    setOpenDialog(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter((q) => q.id !== questionId),
    });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              Quản lý bài quiz
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Tạo và quản lý các câu hỏi kiểm tra
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddQuestion}
            sx={{
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#0d47a1',
              },
              px: 3,
              py: 1,
            }}
          >
            Thêm câu hỏi mới
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {quiz.questions.map((question, index) => (
          <Card
            key={question.id}
            sx={{
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip
                    icon={<HelpIcon />}
                    label={`Câu hỏi ${index + 1}`}
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                    {question.question}
                  </Typography>
                </Box>
                <Box>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton
                      sx={{
                        color: '#1a237e',
                        '&:hover': { backgroundColor: 'rgba(26, 35, 126, 0.1)' },
                      }}
                      onClick={() => handleEditQuestion(question)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      sx={{
                        color: '#d32f2f',
                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' },
                      }}
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ pl: 2 }}>
                {question.options.map((option, optionIndex) => (
                  <Box
                    key={optionIndex}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor:
                        optionIndex === question.correctAnswer
                          ? 'rgba(76, 175, 80, 0.1)'
                          : 'transparent',
                    }}
                  >
                    {optionIndex === question.correctAnswer && (
                      <CheckCircleIcon
                        sx={{ color: '#4caf50', mr: 1, fontSize: '1.2rem' }}
                      />
                    )}
                    <Typography
                      variant="body1"
                      sx={{
                        color:
                          optionIndex === question.correctAnswer
                            ? '#4caf50'
                            : 'inherit',
                        fontWeight:
                          optionIndex === question.correctAnswer
                            ? 'medium'
                            : 'normal',
                      }}
                    >
                      {`${optionIndex + 1}. ${option}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#1a237e', color: 'white' }}>
          {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Câu hỏi"
            fullWidth
            multiline
            rows={2}
            value={newQuestion.question}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, question: e.target.value })
            }
            sx={{ mb: 3 }}
          />
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
            Các lựa chọn
          </Typography>
          {newQuestion.options.map((option, index) => (
            <TextField
              key={index}
              margin="dense"
              label={`Lựa chọn ${index + 1}`}
              fullWidth
              value={option}
              onChange={(e) => {
                const newOptions = [...newQuestion.options];
                newOptions[index] = e.target.value;
                setNewQuestion({ ...newQuestion, options: newOptions });
              }}
              sx={{ mb: 2 }}
            />
          ))}
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend" sx={{ fontWeight: 'medium' }}>
              Đáp án đúng
            </FormLabel>
            <RadioGroup
              value={newQuestion.correctAnswer}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  correctAnswer: parseInt(e.target.value),
                })
              }
            >
              {newQuestion.options.map((_, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={`Lựa chọn ${index + 1}`}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              color: '#666',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveQuestion}
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

export default QuizManager; 