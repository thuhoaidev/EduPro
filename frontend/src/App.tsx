import { Route, Routes } from "react-router-dom";
import SigninPage from "./pages/auth/login";
import SignupPage from "./pages/auth/register";
import UserProfilePage from "./pages/profile";

function App() {
  return (
    <>

      <Routes>
        <Route path="login" element={<SigninPage />} />
        <Route path="register" element={<SignupPage />} />
        <Route path="*" element={<h1>404</h1>} />
        <Route path="profile" element={<UserProfilePage />} />
      </Routes>
    </>
  );
}

export default App;
