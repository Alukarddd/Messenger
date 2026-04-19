--liquibase formatted sql
--changeset marina:add_tables


-- 1. Включаем расширение для работы с UUID (если оно еще не включено)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Таблица чатов (Chats)
-- Здесь id типа UUID, как в твоем классе Chat
CREATE TABLE chats (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       name VARCHAR(255),
                       type VARCHAR(50), -- "PRIVATE" или "GROUP"
                       avatar_url TEXT,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Таблица участников чата (Chat Participants)
-- Связывает пользователей (int) и чаты (UUID)
CREATE TABLE chat_participants (
                                   id SERIAL PRIMARY KEY,
                                   chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                                   user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                   UNIQUE(chat_id, user_id) -- Один и тот же юзер не может быть в чате дважды
);

-- 5. Таблица сообщений (Messages)
CREATE TABLE messages (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                          sender_id INT NOT NULL REFERENCES users(id),
                          content TEXT NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attachments (
                             attachment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
                             chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                             file_id BIGINT NOT NULL, -- ID из вашей системы хранения файлов
                             mime_type VARCHAR(100),  -- например, 'image/png'
                             logic_type VARCHAR(50),  -- например, 'IMAGE', 'FILE', 'LINK'
                             filename VARCHAR(255),
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска всех медиа-файлов конкретного чата
CREATE INDEX idx_attachments_chat_id ON attachments(chat_id);