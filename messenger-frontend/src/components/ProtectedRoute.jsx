import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        // Если токена нет, перенаправляем на логин
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;