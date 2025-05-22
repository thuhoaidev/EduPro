// Component Button tùy chỉnh với Material-UI
import { Button as MuiButton, ButtonProps } from '@mui/material';

// Định nghĩa props cho Button component
interface CustomButtonProps extends ButtonProps {
  // Thêm các props tùy chỉnh nếu cần
}

const Button = (props: CustomButtonProps) => {
  return <MuiButton {...props} />;
};

export default Button; 