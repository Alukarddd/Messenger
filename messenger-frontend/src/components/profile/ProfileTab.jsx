import React, { useRef, useState, useEffect } from 'react';
import { Camera, Edit2, Check, X, Mail, User as UserIcon, Tag, Info } from 'lucide-react';
import { apiFetch } from '../../utils/apiClient';
import AuthenticatedFile from '../chat/AuthenticatedFile';
import '../../pages/styles/Profile.css';

const ProfileTab = ({ user, onUpdateSuccess }) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Состояние формы редактирования
    const [formData, setFormData] = useState({
        id: user?.id,
        name: user?.name || '',
        surname: user?.surname || '',
        username: user?.username || '',
        status: user?.status || '',
        email: user?.email || ''
    });

    // Сбрасываем форму, если данные пользователя изменились извне
    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id,
                name: user.name || '',
                surname: user.surname || '',
                username: user.username || '',
                status: user.status || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setFormData({
            id: user.id,
            name: user.name || '',
            surname: user.surname || '',
            username: user.username || '',
            status: user.status || '',
            email: user.email || ''
        });
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.username || !formData.email) {
            alert("Поля Имя, Username и Email обязательны для заполнения");
            return;
        }

        try {
            // Вызов твоего метода @PostMapping("/update")
            const updatedUser = await apiFetch('/api/users/update', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            onUpdateSuccess(updatedUser); // Обновляем состояние в ChatPage
            setIsEditing(false);
            alert("Профиль успешно обновлен!");
        } catch (error) {
            console.error(error);
            alert("Ошибка при обновлении профиля: " + error.message);
        }
    };

    const handleAvatarClick = () => !isEditing && fileInputRef.current.click();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const form = new FormData();
        form.append('files', file);

        try {
            setIsUploading(true);
            const fileData = await apiFetch('/api/files/upload', {
                method: 'POST', body: form, isFormData: true
            });
            const updatedUser = await apiFetch(`/api/users/me/avatar/${fileData[0].id}`, {
                method: 'POST'
            });
            onUpdateSuccess(updatedUser);
        } catch (error) {
            alert("Ошибка загрузки аватара");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="profile-tab-container">
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

            <div className="profile-header-actions">
                {!isEditing ? (
                    <button className="icon-action-btn edit" onClick={() => setIsEditing(true)}>
                        <Edit2 size={18} />
                    </button>
                ) : (
                    <div className="edit-buttons-group">
                        <button className="icon-action-btn save" onClick={handleSave}>
                            <Check size={20} />
                        </button>
                        <button className="icon-action-btn cancel" onClick={handleCancel}>
                            <X size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className={`avatar-upload-wrapper ${isEditing ? 'disabled' : ''}`} onClick={handleAvatarClick}>
                <div className="profile-avatar-main">
                    {user.avatarUrl ? (
                        <AuthenticatedFile fileId={user.avatarUrl} type="IMAGE" />
                    ) : (
                        user.username?.[0]?.toUpperCase()
                    )}
                </div>
                {!isEditing && (
                    <div className="camera-overlay">
                        <Camera size={18} />
                    </div>
                )}
            </div>

            <div className="profile-info-list">
                {/* USERNAME */}
                <div className="info-item">
                    <span className="info-label"><Tag size={12} /> Username</span>
                    {isEditing ? (
                        <input name="username" value={formData.username} onChange={handleChange} className="profile-edit-input" />
                    ) : (
                        <div className="info-value">@{user.username}</div>
                    )}
                </div>

                {/* NAME */}
                <div className="info-item">
                    <span className="info-label"><UserIcon size={12} /> Имя</span>
                    {isEditing ? (
                        <input name="name" value={formData.name} onChange={handleChange} className="profile-edit-input" />
                    ) : (
                        <div className="info-value">{user.name}</div>
                    )}
                </div>

                {/* SURNAME */}
                <div className="info-item">
                    <span className="info-label"><UserIcon size={12} /> Фамилия</span>
                    {isEditing ? (
                        <input name="surname" value={formData.surname} onChange={handleChange} className="profile-edit-input" />
                    ) : (
                        <div className="info-value">{user.surname || "—"}</div>
                    )}
                </div>

                {/* STATUS */}
                <div className="info-item">
                    <span className="info-label"><Info size={12} /> О себе / Статус</span>
                    {isEditing ? (
                        <textarea name="status" value={formData.status} onChange={handleChange} className="profile-edit-input text-area" />
                    ) : (
                        <div className="info-value status-value">{user.status || "Нет статуса"}</div>
                    )}
                </div>

                {/* EMAIL */}
                <div className="info-item">
                    <span className="info-label"><Mail size={12} /> Почта</span>
                    {isEditing ? (
                        <input name="email" value={formData.email} onChange={handleChange} className="profile-edit-input" />
                    ) : (
                        <div className="info-value">{user.email}</div>
                    )}
                </div>
            </div>

            {isUploading && <div className="upload-loader">Загрузка фото...</div>}
        </div>
    );
};

export default ProfileTab;