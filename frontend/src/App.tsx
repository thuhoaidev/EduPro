import { Route, Routes } from "react-router-dom";

import UserProfilePage from "./pages/profile";

function App() {
  return (
    <>

      <Routes>
        {/* <Route path="login" element={<SigninPage />} />
        <Route path="register" element={<SignupPage />} /> */}
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </>
  );
}

export default App;
