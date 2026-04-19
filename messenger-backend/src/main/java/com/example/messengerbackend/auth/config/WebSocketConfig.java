package com.example.messengerbackend.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic"); // Префикс для прослушивания (подписки)
        config.setApplicationDestinationPrefixes("/app"); // Префикс для отправки сообщений на сервер
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat") // Точка подключения для фронтенда
                .setAllowedOriginPatterns("http://localhost:5173")
                .withSockJS();
    }
}