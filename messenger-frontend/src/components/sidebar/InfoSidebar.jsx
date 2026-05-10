import React, { useState, useEffect } from 'react';
import { X, ImageIcon, FileText, Link as LinkIcon, User } from 'lucide-react';
import { apiFetch } from '../../utils/apiClient';
import AuthenticatedFile from '../chat/AuthenticatedFile';
import '../../pages/styles/Sidebar.css';

const InfoSidebar = ({ chat, onClose }) => {
    const [attachments, setAttachments] = useState([]);
    const [activeTab, setActiveTab] = useState('media'); // 'media' или 'files'

    useEffect(() => {
        if (chat) {
            apiFetch(`/api/attachments/chat/${chat.id}`)
                .then(data => setAttachments(data || []))
                .catch(console.error);
        }
    }, [chat]);

    // Фильтруем файлы по типам
    const mediaFiles = attachments.filter(a => a.logicType === 'IMAGE');
    const documents = attachments.filter(a => a.logicType === 'FILE');

    return (
        <aside className="sidebar-right">
            <div className="sidebar-right-header">
                <h3>Информация</h3>
                <button className="close-btn" onClick={onClose}><X size={20} /></button>
            </div>

            <div className="sidebar-right-content">
                {/* Секция профиля собеседника */}
                <div className="info-profile-card">
                    <div className="avatar-huge">
                        {chat.partnerName[0]}
                    </div>
                    <h4>{chat.partnerName}</h4>
                    <p className="info-username">@{chat.partnerUsername}</p>
                </div>

                {/* Переключатель вкладок */}
                <div className="sidebar-tabs">
                    <button 
                        className={`tab-link ${activeTab === 'media' ? 'active' : ''}`}
                        onClick={() => setActiveTab('media')}
                    >
                        <ImageIcon size={18} />
                        <span>Медиа</span>
                    </button>
                    <button 
                        className={`tab-link ${activeTab === 'files' ? 'active' : ''}`}
                        onClick={() => setActiveTab('files')}
                    >
                        <FileText size={18} />
                        <span>Файлы</span>
                    </button>
                </div>

                {/* Контент вкладок */}
                <div className="tab-content">
                    {activeTab === 'media' && (
                        <div className="media-grid">
                            {mediaFiles.length > 0 ? (
                                mediaFiles.map(img => (
                                    <div key={img.id} className="media-tile">
                                        <AuthenticatedFile 
                                            fileId={img.fileId} 
                                            type="IMAGE" 
                                            className="tile-img"
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="empty-msg">Нет медиафайлов</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <div className="files-list">
                            {documents.length > 0 ? (
                                documents.map(file => (
                                    <AuthenticatedFile 
                                        key={file.id} 
                                        fileId={file.fileId} 
                                        filename={file.filename} 
                                        type="FILE" 
                                    />
                                ))
                            ) : (
                                <p className="empty-msg">Нет документов</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default InfoSidebar;