import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiClient.js';
import './styles/Auth.css';

export default function Register({ onAuthSuccess }) {
  const [form, setForm] = useState({
    name: '', surname: '', username: '', email: '', password: ''
  });
   const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      onAuthSuccess();
    } catch (err) {
      alert("Ошибка регистрации");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <h2>Создать аккаунт</h2>
        <input placeholder="Имя" onChange={e => setForm({...form, name: e.target.value})} required />
        <input placeholder="Фамилия" onChange={e => setForm({...form, surname: e.target.value})} required />
        <input placeholder="Логин (username)" onChange={e => setForm({...form, username: e.target.value})} required />
        <input type="email" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} required />
        <input type="password" placeholder="Пароль" onChange={e => setForm({...form, password: e.target.value})} required />
        <button type="submit">Зарегистрироваться</button>
        <p className="auth-link" onClick={()=> navigate('/login')}>Уже есть аккаунт? Войти</p>
      </form>
    </div>
  );
}