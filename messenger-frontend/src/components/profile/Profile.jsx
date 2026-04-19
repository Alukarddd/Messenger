import React from 'react';
import { User, Mail, Calendar, Hash, Edit2, Check, X, UserCircle } from 'lucide-react';
import './Profile.css'
import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/apiClient';

const ProfileTab = ({ user, onUpdateSuccess }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // 1. Инициализируем состояние. 
    // Если данных еще нет, поля будут пустыми, но мы это обработаем ниже.
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        surname: '',
        username: '',
        status: '',
        email: ''
    });

    // 2. СИНХРОНИЗАЦИЯ: Как только 'user' в пропсах изменится (данные подгрузятся),
    // этот эффект мгновенно заполнит форму реальными данными.
    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id || '',
                name: user.name || '',
                surname: user.surname || '',
                username: user.username || '',
                status: user.status || '',
                email: user.email || ''
            });
        }
    }, [user]); // Следим за изменением объекта user

    const handleSave = async () => {
        console.log(formData)
        try {
            const updatedUser = await apiFetch('/api/users/update', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            
            setIsEditing(false);
            if (onUpdateSuccess) onUpdateSuccess(updatedUser);
            alert("Данные обновлены!");
        } catch (err) {
            alert("Ошибка сохранения: " + err.message);
        }
    };

    // 3. ЗАЩИТА (Условный рендеринг): 
    // Пока 'user' не пришел с бэкенда (равен null), показываем индикатор загрузки.
    // Это предотвращает отображение id: 0 или пустых полей.
    if (!user) {
        return (
            <div className="profile-view">
                <div className="loading-spinner">Загрузка данных профиля...</div>
            </div>
        );
    }

    return (
        <div className="profile-view">
            <div className="profile-header-row">
                <h3 style={{ margin: 0 }}>Мой профиль</h3>
                {!isEditing ? (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        <Edit2 size={16} />
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="save-btn" onClick={handleSave}><Check size={16} /></button>
                        <button className="cancel-btn" onClick={() => setIsEditing(false)}><X size={16} /></button>
                    </div>
                )}
            </div>

            <div className="profile-avatar-big">
                <User size={60} />
            </div>

            {/* Пример поля: Имя */}
            <div className="profile-info-group">
                <span className="profile-label">Имя</span>
                {isEditing ? (
                    <input 
                        className="edit-input" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                ) : (
                    <div className="profile-value">{user.name}</div>
                )}
            </div>

            {/* Фамилия */}
            <div className="profile-info-group">
                <span className="profile-label">Фамилия</span>
                {isEditing ? (
                    <input 
                        className="edit-input" 
                        value={formData.surname} 
                        onChange={e => setFormData({...formData, surname: e.target.value})} 
                    />
                ) : (
                    <div className="profile-value">{user.surname}</div>
                )}
            </div>

            {/* Статус */}
            <div className="profile-info-group">
                <span className="profile-label">Статус</span>
                {isEditing ? (
                    <textarea 
                        className="edit-input" 
                        value={formData.status} 
                        onChange={e => setFormData({...formData, status: e.target.value})} 
                    />
                ) : (
                    <div className="profile-value" style={{color: '#4caf50'}}>{user.status || "Нет статуса"}</div>
                )}
            </div>

            {/* Почта (только для чтения или редактирования) */}
            <div className="profile-info-group">
                <span className="profile-label">Email</span>
                {isEditing ? (
                    <input 
                        className="edit-input" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                ) : (
                    <div className="profile-value">{user.email}</div>
                )}
            </div>

            <div className="profile-info-group">
                <span className="profile-label">ID пользователя</span>
                <div className="profile-value" style={{color: '#999'}}>#{user.id}</div>
            </div>
        </div>
    );
};

export default ProfileTab;