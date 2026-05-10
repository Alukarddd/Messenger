import React, { useRef } from 'react';
import { Paperclip, Send } from 'lucide-react';

const MessageInput = ({ message, setMessage, onSend, onFileUpload, isUploading, selectedFilesCount, onClearFiles }) => {
    const fileInputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="message-input-wrapper">
            {selectedFilesCount > 0 && (
                <div className="files-badge">
                    Прикреплено файлов: {selectedFilesCount} 
                    <span className="clear-files" onClick={onClearFiles}>✕</span>
                </div>
            )}
            <div className="input-area">
                <input 
                    type="file" multiple ref={fileInputRef} style={{ display: 'none' }} 
                    onChange={onFileUpload} 
                />
                <button 
                    className={`icon-btn ${isUploading ? 'loading' : ''}`}
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                >
                    <Paperclip size={22} />
                </button>

                <textarea
                    className="message-input-field"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isUploading ? "Загрузка файлов..." : "Напишите сообщение..."}
                    onKeyDown={handleKeyDown}
                    rows="1"
                />
                
                <button className="send-btn" onClick={onSend} disabled={!message.trim() && selectedFilesCount === 0}>
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;