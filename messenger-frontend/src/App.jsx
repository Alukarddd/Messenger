import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login'; // Убедись, что путь правильный
import RegisterPage from './pages/Register'; 
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    // Эффект для темы (как в твоем примере)
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    return (
        <Router>
            <Routes>
                {/* Публичные маршруты */}
                <Route path="/login" element={<LoginPage onAuthSuccess={() => window.location.href = '/'} />} />
                <Route path="/register" element={<RegisterPage onAuthSuccess={() => window.location.href = '/'} />} />

                {/* Защищенный маршрут: Чат */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />

                {/* Если адрес не найден — на главную */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;