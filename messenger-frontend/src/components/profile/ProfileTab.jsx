import React, { useState } from 'react';
import { User, Mail, Edit2, Check, X } from 'lucide-react';
import { apiFetch } from '../../utils/apiClient';

const ProfileTab = ({ user, onUpdateSuccess }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ ...user });

    const handleSave = async () => {
        const updated = await apiFetch('/api/users/update', {
            method: 'POST',
            body: JSON.stringify(form)
        });
        onUpdateSuccess(updated);
        setIsEditing(false);
    };

    return (
        <div className="profile-tab-container">
            <div className="profile-header">
                <div className="avatar-huge">{user.username[0].toUpperCase()}</div>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="edit-profile-btn"><Edit2 size={16} /> Изменить</button>
                ) : (
                    <div className="edit-actions">
                        <button onClick={handleSave} className="save-btn"><Check size={16} /></button>
                        <button onClick={() => setIsEditing(false)} className="cancel-btn"><X size={16} /></button>
                    </div>
                )}
            </div>

            <div className="profile-fields">
                <div className="field">
                    <label>Имя</label>
                    {isEditing ? <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /> : <p>{user.name}</p>}
                </div>
                <div className="field">
                    <label>Фамилия</label>
                    {isEditing ? <input value={form.surname} onChange={e => setForm({...form, surname: e.target.value})} /> : <p>{user.surname}</p>}
                </div>
                <div className="field">
                    <label>Статус</label>
                    {isEditing ? <textarea value={form.status} onChange={e => setForm({...form, status: e.target.value})} /> : <p className="status-text">{user.status || "Нет статуса"}</p>}
                </div>
                <div className="field">
                    <label><Mail size={14} /> Email</label>
                    <p>{user.email}</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;