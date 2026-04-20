import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

const App = () => {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<ProtectedRoute>
          <ChatPage />
          </ProtectedRoute>} />
          <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
};

export default App;