import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiClient.js';
import './styles/Auth.css';

export default function Login({ onAuthSuccess}) {
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      // Сохраняем токены, которые вернул AuthController
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      onAuthSuccess();
    } catch (err) {
      alert("Ошибка: " + err.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <h2>Вход в Messenger</h2>
        <input placeholder="Логин" onChange={e => setForm({...form, username: e.target.value})} required />
        <input type="password" placeholder="Пароль" onChange={e => setForm({...form, password: e.target.value})} required />
        <button type="submit">Войти</button>
        <p className="auth-link" onClick={()=> navigate('/register')}>Нет аккаунта? Регистрация</p>
      </form>
    </div>
  );
}