import React, { useState, useEffect } from 'react';
import { User, MessageSquare, Settings, Send, Paperclip, X } from 'lucide-react';
import { apiFetch } from '../utils/apiClient';
import ProfileTab from '../components/profile/Profile'; // Импортируем новый компонент
import '../App.css';

const ChatPage = () => {
    const [searchQuery, setSearchQuery] = useState(""); // Текст в инпуте
    const [myChats, setMyChats] = useState([]); // Все мои чаты
    const [selectedChat, setSelectedChat] = useState(null); // Чат, который открыт сейчас
    const [messages, setMessages] = useState([]); // Сообщения выбранного чата
    const [searchResults, setSearchResults] = useState([]); // Список найденных людей
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' или 'profile'
    const [currentUser, setCurrentUser] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [message, setMessage] = useState("");

    const isAuthenticated = !!localStorage.getItem('accessToken');

    // Внутри ChatPage.jsx
    const handleUserUpdate = (updatedUser) => {
        setCurrentUser(updatedUser); // Обновляем состояние в главном компоненте
    };

    // Загружаем данные пользователя один раз при открытии приложения
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const data = await apiFetch('/api/users/me');
                setCurrentUser(data);
            } catch (err) {
                console.error("Ошибка загрузки профиля", err);
            }
        };
        fetchMe();
    }, []);


    // Загрузка списка чатов при старте
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await apiFetch('/api/chats/my');
                setMyChats(data);
            } catch (err) { console.error("Ошибка загрузки чатов", err); }
        };
        fetchChats();
    }, [isAuthenticated]); // Перезагрузить, если статус авторизации изменился

    // Загрузка сообщений при выборе чата
    useEffect(() => {
        if (selectedChat) {
            const fetchMessages = async () => {
                try {
                    const data = await apiFetch(`/api/chats/${selectedChat.id}/messages`);
                    setMessages(data);
                } catch (err) { console.error("Ошибка загрузки сообщений", err); }
            };
            fetchMessages();
        }
    }, [selectedChat]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 1) { // Ищем, если введено больше 1 буквы
                try {
                    // Вызываем твой новый эндпоинт
                    const data = await apiFetch(`/api/users/search?username=${searchQuery}`);
                    setSearchResults(data);
                } catch (err) {
                    console.error("Ошибка поиска:", err);
                }
            } else {
                setSearchResults([]);
            }
        }, 500); // Задержка 0.5 сек (чтобы не спамить сервер при каждой букве)

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);


    const handleStartChat = async (userId) => {
        try {
            const newChat = await apiFetch(`/api/chats/create-private/${userId}`, { method: 'POST' });
            setSearchQuery("");
            // Сразу запрашиваем список чатов заново, чтобы увидеть новый
            const updatedChats = await apiFetch('/api/chats/my');
            setMyChats(updatedChats);

            // Находим созданный чат в списке и открываем его
            const found = updatedChats.find(c => c.id === newChat.id);
            if (found) setSelectedChat(found);
        } catch (err) { alert("Ошибка при создании чата"); }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

        return (
        <div className="app-container">
            <div className="sidebar-left">
                <div className="sidebar-header">
                    <div className="sidebar-header-top">
                        <h2 className="sidebar-title">Мессенджер</h2>
                        <button onClick={handleLogout} className="logout-btn">Выход</button>
                    </div>

                    <div className="tab-buttons">
                        <button
                            className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
                            onClick={() => setActiveTab('chats')}
                        >
                            <MessageSquare size={16} /> Чаты
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <Settings size={16} /> Профиль
                        </button>
                    </div>
                </div>

                {activeTab === 'chats' ? (
                    <>
                        {/* СТРОКА ПОИСКА */}
                        <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                            <input
                                className="status-input"
                                style={{
                                    width: '100%',
                                    padding: '10px 15px',
                                    borderRadius: '20px',
                                    border: '1px solid #ddd',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Поиск по username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="chat-list">
                            {/* ЛОГИКА ОТОБРАЖЕНИЯ */}
                            {searchQuery.trim().length > 0 ? (
                                /* 1. ЕСЛИ ПОЛЬЗОВАТЕЛЬ ИЩЕТ (пишет в инпуте) */
                                searchResults.length > 0 ? (
                                    searchResults.map(foundUser => (
                                        <div
                                            key={foundUser.id}
                                            className="chat-item search-result"
                                            onClick={() => handleStartChat(foundUser.id)}
                                            style={{ borderLeft: '4px solid #0088cc' }}
                                        >
                                            <div className="avatar"><User size={24} /></div>
                                            <div className="chat-info">
                                                <div className="chat-info-name">@{foundUser.username}</div>
                                                <div className="chat-info-last-msg">
                                                    {foundUser.name} {foundUser.surname} • Начать чат
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'gray' }}>
                                        Пользователь не найден
                                    </div>
                                )
                            ) : (
                                /* 2. ЕСЛИ ПОИСК ПУСТОЙ - ПОКАЗЫВАЕМ РЕАЛЬНЫЕ ЧАТЫ ИЗ БАЗЫ (myChats) */
                                myChats.length > 0 ? (
                                    myChats.map(chat => (
                                        <div
                                            key={chat.id}
                                            className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                            onClick={() => setSelectedChat(chat)}
                                        >
                                            <div className="avatar">
                                                <div style={{ 
                                                    width: '40px', height: '40px', borderRadius: '50%', 
                                                    backgroundColor: '#0088cc', color: 'white', 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                                }}>
                                                    {chat.partnerName?.charAt(0) || 'U'}
                                                </div>
                                            </div>
                                            <div className="chat-info">
                                                <div className="chat-info-name">{chat.partnerName}</div>
                                                <div className="chat-info-last-msg">{chat.lastMessage || "Нет сообщений"}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* ЕСЛИ В БАЗЕ ЕЩЕ НЕТ ЧАТОВ */
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'gray' }}>
                                        У вас пока нет чатов. Используйте поиск, чтобы найти собеседника.
                                    </div>
                                )
                            )}
                        </div>
                    </>
                ) : (
                    <ProfileTab
                        user={currentUser}
                        onUpdateSuccess={handleUserUpdate}
                    />
                )}
            </div>

            {/* Правая часть (Окно чата) */}
            <div className="chat-window">
                {selectedChat ? (
                    <>
                        <div className="chat-header">
                            <div className="header-user-info" onClick={() => setSidebarOpen(true)} style={{cursor: 'pointer'}}>
                                <div className="info-icon-btn"><User size={24} color="#555" /></div>
                                <div>
                                    <div className="user-name">{selectedChat.partnerName}</div>
                                    <div className="user-status-online">@{selectedChat.partnerUsername}</div>
                                </div>
                            </div>
                        </div>

                        <div className="messages-area">
                            {messages.length > 0 ? (
                                messages.map(msg => (
                                    <div key={msg.id} className="message-bubble">
                                        {msg.content}
                                        <div style={{ fontSize: '10px', color: 'gray', textAlign: 'right', marginTop: '4px' }}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', color: 'gray', marginTop: '20px' }}>
                                    Сообщений пока нет. Будьте первым!
                                </div>
                            )}
                        </div>
                        
                        {/* ПОЛЕ ВВОДА СООБЩЕНИЯ (добавь этот блок, если его не было) */}
                        <div className="input-area">
                            <Paperclip size={20} style={{ color: 'gray', cursor: 'pointer' }} />
                            <input
                                className="message-input"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Напишите сообщение..."
                                onKeyDown={(e) => e.key === 'Enter' && alert("Тут будет отправка")} 
                            />
                            <div className="send-btn"><Send size={20} /></div>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'gray' }}>
                        Выберите чат или используйте поиск, чтобы начать общение
                    </div>
                )}
            </div>

            {/* Боковая панель инфо */}
            {isSidebarOpen && (
                <div className="sidebar-right">
                    <div className="sidebar-right-header">
                        <h3>Информация</h3>
                        <X onClick={() => setSidebarOpen(false)} style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ padding: '20px' }}>
                        <p><strong>Username:</strong> @{selectedChat?.partnerUsername}</p>
                        <p>Здесь будут медиа чата...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;