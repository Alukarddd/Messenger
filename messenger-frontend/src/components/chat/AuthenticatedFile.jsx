import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { apiFetch } from '../../utils/apiClient';

const AuthenticatedFile = ({ fileId, filename, type, className }) => {
    // У тебя переменная называется blobUrl
    const [blobUrl, setUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (type === 'IMAGE') {
            setLoading(true);
            apiFetch(`/api/files/download/${fileId}`, { isBlob: true })
                .then(blob => setUrl(URL.createObjectURL(blob)))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
        // Очистка памяти
        return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
    }, [fileId, type]);

    const handleDownload = async () => {
        try {
            const blob = await apiFetch(`/api/files/download/${fileId}`, { isBlob: true });
            const downloadUrl = window.URL.createObjectURL(blob); // Локальная переменная для скачивания
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', filename || 'file');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error(error);
            alert("Ошибка при скачивании файла");
        }
    };

    if (type === 'IMAGE') {
        // ИСПРАВЛЕНО: используем blobUrl вместо url
        if (loading) return <div className="loading-tile">Загрузка...</div>;
        
        return blobUrl ? (
            <img 
                src={blobUrl} 
                className={className || "attachment-preview"} 
                alt={filename} 
                onClick={handleDownload} 
            />
        ) : <div className="loading-tile">Ошибка</div>;
    }

    return (
        <div className="file-link" onClick={handleDownload} style={{ cursor: 'pointer' }}>
            <FileText size={16} />
            <span className="file-name-text">{filename}</span>
            <Download size={14} className="download-icon" />
        </div>
    );
};

export default AuthenticatedFile;