package com.thet0rnado.mylittleagentworld.ai.messaging;

import com.thet0rnado.mylittleagentworld.ai.dto.ConversationResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ConversationProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.news}")
    private String exchange;

    @Value("${rabbitmq.routing-key.conversation}")
    private String routingKey;

    public void sendConversation(ConversationResultDto result) {
        log.info("📤 Отправляем разговор в world-service. Тема: {}", result.getTopic());
        rabbitTemplate.convertAndSend(exchange, routingKey, result);
        log.info("✅ Разговор отправлен!");
    }
}