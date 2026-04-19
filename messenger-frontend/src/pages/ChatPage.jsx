import React, { useState, useEffect, useRef } from 'react';
import { User, MessageSquare, Settings, Send, Paperclip, X } from 'lucide-react';
import { apiFetch } from '../utils/apiClient';
import ProfileTab from '../components/profile/Profile'; // Импортируем новый компонент
import SockJS from 'sockjs-client'; // Добавили импорт
import Stomp from 'stompjs';       // Добавили импорт
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
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef(null); // Для автоскролла вниз
    const [selectedFiles, setSelectedFiles] = useState([]); // Для хранения ID загруженных файлов
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [chatAttachments, setChatAttachments] = useState([]);


    const isAuthenticated = !!localStorage.getItem('accessToken');

    // Внутри ChatPage.jsx
    const handleUserUpdate = (updatedUser) => {
        setCurrentUser(updatedUser); // Обновляем состояние в главном компоненте
    };

    const openChatInfo = async () => {
        setSidebarOpen(true);
        try {
            // Создай такой эндпоинт в AttachmentController на бэкенде
            const data = await apiFetch(`/api/attachments/chat/${selectedChat.id}`);
            setChatAttachments(data);
        } catch (err) {
            console.error("Не удалось загрузить медиа чата");
        }
    };

    const handleFileChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]); // "files" должно совпадать с @RequestParam("files") в Java
        }

        try {
            setIsUploading(true);
            // Загружаем файлы на бэкенд (FilesController)
            const response = await apiFetch('/api/files/upload', {
                method: 'POST',
                body: formData,
                isFormData: true // apiClient поймет, что не нужно ставить JSON заголовки
            });

            // Сохраняем полученные ID файлов
            const uploadedIds = response.map(f => f.id);
            setSelectedFiles(prev => [...prev, ...uploadedIds]);
            console.log("Файлы загружены, ID:", uploadedIds);
        } catch (err) {
            alert("Ошибка при загрузке файлов на сервер");
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    // Функция для автоскролла к последнему сообщению
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- 1. ПОДКЛЮЧЕНИЕ К WEBSOCKET ПРИ ЗАПУСКЕ ПРИЛОЖЕНИЯ ---
    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws-chat');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log("Успешное подключение к WebSocket");
            setConnected(true);
            setStompClient(client);
        }, (error) => {
            console.error("Ошибка подключения к WS:", error);
        });

        return () => {
            if (client) client.disconnect();
        };
    }, []);

    // --- 2. ПОДПИСКА НА СООБЩЕНИЯ КОНКРЕТНОГО ЧАТА ---
    useEffect(() => {
        if (stompClient && selectedChat && connected) {
            // Подписываемся на топик чата: /topic/chat/{UUID}
            const subscription = stompClient.subscribe(`/topic/chat/${selectedChat.id}`, (payload) => {
                const newMessage = JSON.parse(payload.body);
                // Добавляем новое сообщение в список мгновенно
                setMessages((prev) => [...prev, newMessage]);
            });

            return () => subscription.unsubscribe(); // Отписываемся при смене чата
        }
    }, [stompClient, selectedChat, connected]);


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
        if (isSidebarOpen && selectedChat) {
            const fetchAttachments = async () => {
                try {
                    const data = await apiFetch(`/api/attachments/chat/${selectedChat.id}`);
                    setChatAttachments(data || []);
                } catch (err) {
                    console.error("Ошибка загрузки вложений", err);
                }
            };
            fetchAttachments();
        }
    }, [isSidebarOpen, selectedChat]); // Зависимости: открыта ли панель и какой чат выбран

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

    const handleDownload = async (fileId, filename) => {
        try {
            // Используем твой apiFetch, который уже умеет прикреплять токен
            // ВАЖНО: apiFetch должен возвращать blob, если это файл
            const response = await apiFetch(`/api/files/download/${fileId}`, {
                method: 'GET',
                isBlob: true // Добавим этот флаг для нашего apiClient
            });

            // Создаем временную ссылку в памяти браузера
            const url = window.URL.createObjectURL(response);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename); // Устанавливаем имя файла
            document.body.appendChild(link);
            link.click();

            // Очистка памяти
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Ошибка при скачивании файла:", error);
            alert("Не удалось скачать файл");
        }
    };


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

    // --- 3. ФУНКЦИЯ ОТПРАВКИ СООБЩЕНИЯ ---
    const handleSendMessage = () => {
        // Проверяем, что есть ЛИБО текст, ЛИБО выбранные файлы
        if (stompClient && connected && (message.trim() || selectedFiles.length > 0) && selectedChat) {
            const messageRequest = {
                content: message,
                senderId: currentUser.id,
                fileIds: selectedFiles // Массив ID загруженных файлов
            };

            stompClient.send(`/app/chat/${selectedChat.id}`, {}, JSON.stringify(messageRequest));

            setMessage("");
            setSelectedFiles([]); // Важно очистить список файлов после отправки!
        }
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
            {/* Правая часть (Окно чата) */}
            <div className="chat-window">
                {selectedChat ? (
                    <>
                        <div className="chat-header">
                            <div className="header-user-info" onClick={() => setSidebarOpen(true)} style={{ cursor: 'pointer' }}>
                                <div className="info-icon-btn"><User size={24} color="#555" /></div>
                                <div>
                                    <div className="user-name">{selectedChat.partnerName}</div>
                                    <div className="user-status-online">@{selectedChat.partnerUsername}</div>
                                </div>
                            </div>
                        </div>

                        {/* ИЗМЕНЕНИЕ 1: Добавлен контейнер для сообщений с логикой "свой/чужой" */}
                        <div className="messages-area">
                            {messages.length > 0 ? (
                                messages.map((msg, index) => (

                                    <div
                                        key={msg.id || index}
                                        /* Динамический класс: если senderId совпадает с моим — сообщение справа */
                                        className={`message-bubble ${msg.senderId === currentUser?.id ? 'my-message' : 'partner-message'}`}
                                    >
                                        <div className="message-content">
                                            {msg.content}

                                            {msg.attachments && msg.attachments.map(att => (
                                                <div key={att.id} className="attachment-item">
                                                    {att.logicType === 'IMAGE' ? (
                                                        /* Используем наш новый компонент для картинок */
                                                        <AuthenticatedImage
                                                            fileId={att.fileId}
                                                            style={{ maxWidth: '200px', borderRadius: '8px', marginTop: '5px', cursor: 'pointer' }}
                                                        />
                                                    ) : (
                                                        /* Для файлов используем кнопку, которая вызывает handleDownload */
                                                        <div
                                                            onClick={() => handleDownload(att.fileId, att.filename)}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                textDecoration: 'none',
                                                                color: '#0088cc',
                                                                cursor: 'pointer',
                                                                marginTop: '5px'
                                                            }}
                                                        >
                                                            <Paperclip size={14} />
                                                            <span>{att.filename}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="message-time">
                                            {msg.createdAt
                                                ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : 'отправка...'}
                                        </div>

                                    </div>

                                ))
                            ) : (
                                <div style={{ textAlign: 'center', color: 'gray', marginTop: '20px' }}>
                                    Сообщений пока нет. Будьте первым!
                                </div>
                            )}
                            {/* ИЗМЕНЕНИЕ 2: Якорь для автоскролла. Сюда будет прокручиваться экран при новом сообщении */}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="input-area">
                            {/* 1. Добавляем скрытый инпут */}
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />

                            {/* 2. Добавляем onClick на скрепку */}
                            <Paperclip
                                size={20}
                                style={{
                                    color: isUploading ? '#0088cc' : 'gray',
                                    cursor: isUploading ? 'wait' : 'pointer',
                                    opacity: isUploading ? 0.5 : 1
                                }}
                                onClick={() => !isUploading && fileInputRef.current.click()}
                            />

                            <input
                                className="message-input"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={isUploading ? "Загрузка файлов..." : "Напишите сообщение..."}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />

                            <div
                                className="send-btn"
                                onClick={handleSendMessage}
                                style={{ opacity: (connected && !isUploading) ? 1 : 0.5, cursor: 'pointer' }}
                            >
                                <Send size={20} />
                            </div>
                        </div>

                        {/* 3. Визуальный список прикрепленных файлов перед отправкой (опционально) */}
                        {selectedFiles.length > 0 && (
                            <div style={{ padding: '5px 20px', fontSize: '12px', color: '#0088cc' }}>
                                Прикреплено файлов: {selectedFiles.length}
                                <span
                                    style={{ marginLeft: '10px', color: 'red', cursor: 'pointer' }}
                                    onClick={() => setSelectedFiles([])}
                                >
                                    (Очистить)
                                </span>
                            </div>
                        )}
                    </>
                ) : (
                    /* Если чат не выбран — показываем заглушку */
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'gray' }}>
                        <MessageSquare size={48} style={{ marginBottom: '10px', opacity: 0.3 }} />
                        <p>Выберите чат или используйте поиск, чтобы начать общение</p>
                    </div>
                )}
            </div>

            {/* Боковая панель инфо */}
            {isSidebarOpen && (
                <div className="sidebar-right">
                    <div className="media-grid">
                        {chatAttachments.filter(a => a.logicType === 'IMAGE').map(img => (
                            <img key={img.id} src={`http://localhost:8080/api/files/download/${img.fileId}`} className="media-item" />
                        ))}
                    </div>

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

const AuthenticatedImage = ({ fileId, style }) => {
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        const loadImage = async () => {
            try {
                const blob = await apiFetch(`/api/files/download/${fileId}`, { isBlob: true });
                const url = URL.createObjectURL(blob);
                setImageSrc(url);
            } catch (e) {
                console.error("Ошибка загрузки картинки", e);
            }
        };
        loadImage();

        // Очищаем URL из памяти при размонтировании
        return () => { if (imageSrc) URL.revokeObjectURL(imageSrc); };
    }, [fileId]);

    if (!imageSrc) return <div style={{ ...style, backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</div>;

    return <img src={imageSrc} style={style} alt="attachment" />;
};