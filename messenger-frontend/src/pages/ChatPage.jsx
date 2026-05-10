import React, { useState, useEffect, useRef } from 'react';
import { apiFetch, logout } from '../utils/apiClient';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { MessageSquare, Settings, User } from 'lucide-react';

// Импорт твоих новых компонентов
import ProfileTab from '../components/profile/ProfileTab';
import MessageInput from '../components/chat/MessageInput';
import AuthenticatedFile from '../components/chat/AuthenticatedFile';
import SearchBar from '../components/sidebar/SearchBar';
import InfoSidebar from '../components/sidebar/InfoSidebar';

// Импорт стилей
import '../pages/styles/ChatPage.css';
import '../pages/styles/Message.css';

const ChatPage = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [myChats, setMyChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('chats');
    const [searchQuery, setSearchQuery] = useState("");
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);

    // 1. Загрузка данных при старте
    useEffect(() => {
        apiFetch('/api/users/me').then(setCurrentUser).catch(console.error);
        fetchChats();

        const socket = new SockJS('http://localhost:8080/ws-chat');
        const client = Stomp.over(socket);
        client.connect({}, () => setStompClient(client));

        return () => { if (client && client.connected) client.disconnect(); };
    }, []);

    // 2. Подписка на сообщения чата
    useEffect(() => {
        if (stompClient && selectedChat) {
            const sub = stompClient.subscribe(`/topic/chat/${selectedChat.id}`, (payload) => {
                const newMessage = JSON.parse(payload.body);
                setMessages(prev => [...prev, newMessage]);
            });
            apiFetch(`/api/chats/${selectedChat.id}/messages`).then(setMessages);
            return () => sub.unsubscribe();
        }
    }, [stompClient, selectedChat]);

    const fetchChats = async () => {
        const data = await apiFetch('/api/chats/my');
        setMyChats(data || []);
    };

    const handleSendMessage = () => {
        if (!stompClient || !selectedChat || (!message.trim() && selectedFiles.length === 0)) return;
        const payload = { content: message, senderId: currentUser.id, fileIds: selectedFiles };
        stompClient.send(`/app/chat/${selectedChat.id}`, {}, JSON.stringify(payload));
        setMessage("");
        setSelectedFiles([]);
    };

    const handleFileUpload = async (e) => {
        const formData = new FormData();
        Array.from(e.target.files).forEach(f => formData.append('files', f));
        setIsUploading(true);
        try {
            const res = await apiFetch('/api/files/upload', { method: 'POST', body: formData, isFormData: true });
            setSelectedFiles(prev => [...prev, ...res.map(f => f.id)]);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="app-container">
            {/* ЛЕВАЯ ЧАСТЬ */}
            <aside className="sidebar-left">
                <div className="sidebar-header">
                    <div className="sidebar-header-top">
                        <h2 style={{margin:0}}>Мессенджер</h2>
                        <button onClick={logout} className="logout-btn">Выход</button>
                    </div>
                    <div className="tab-buttons">
                        <button className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`} onClick={() => setActiveTab('chats')}>
                            <MessageSquare size={16} /> Чаты
                        </button>
                        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                            <Settings size={16} /> Профиль
                        </button>
                    </div>
                </div>

                {activeTab === 'chats' ? (
                    <>
                        <SearchBar 
                            query={searchQuery} 
                            setQuery={setSearchQuery} 
                            onStartChat={async (userId) => {
                                const newChat = await apiFetch(`/api/chats/create-private/${userId}`, { method: 'POST' });
                                await fetchChats();
                                setSelectedChat(newChat);
                                setSearchQuery("");
                            }}
                        />
                        <div className="chat-list" style={{flex:1, overflowY:'auto'}}>
                            {myChats.map(chat => (
                                <div key={chat.id} className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`} onClick={() => setSelectedChat(chat)}>
                                    <div className="avatar">{chat.partnerName[0]}</div>
                                    <div className="chat-info">
                                        <div className="chat-info-name">{chat.partnerName}</div>
                                        <div className="chat-info-last-msg">{chat.lastMessage}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <ProfileTab user={currentUser} onUpdateSuccess={setCurrentUser} />
                )}
            </aside>

            {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ */}
            <main className="chat-window">
                {selectedChat ? (
                    <>
                        <header className="chat-header" onClick={() => setSidebarOpen(true)} style={{cursor:'pointer', padding:'15px', background:'white', borderBottom:'1px solid #ddd'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <div className="avatar-small"><User size={20}/></div>
                                <strong>{selectedChat.partnerName}</strong>
                            </div>
                        </header>

                        <div className="messages-container">
                            {messages.map((msg, i) => (
                                <div key={msg.id || i} className={`message-bubble ${msg.senderId === currentUser?.id ? 'my-message' : 'partner-message'}`}>
                                    <div className="message-text">{msg.content}</div>
                                    {msg.attachments?.map(att => (
                                        <AuthenticatedFile key={att.id} fileId={att.fileId} filename={att.filename} type={att.logicType} />
                                    ))}
                                    <div className="message-time">
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <MessageInput 
                            message={message} 
                            setMessage={setMessage} 
                            onSend={handleSendMessage} 
                            onFileUpload={handleFileUpload}
                            isUploading={isUploading}
                            selectedFilesCount={selectedFiles.length}
                            onClearFiles={() => setSelectedFiles([])}
                        />
                    </>
                ) : (
                    <div className="empty-state">Выберите чат или воспользуйтесь поиском</div>
                )}
            </main>

            {/* ПРАВАЯ ЧАСТЬ */}
            {isSidebarOpen && <InfoSidebar chat={selectedChat} onClose={() => setSidebarOpen(false)} />}
        </div>
    );
};

export default ChatPage;