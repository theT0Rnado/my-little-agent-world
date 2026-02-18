package com.thet0rnado.mylittleagentworld.ai.messaging;

import com.thet0rnado.mylittleagentworld.ai.dto.NewsMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NewsProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.news}")
    private String newsExchange;

    @Value("${rabbitmq.routing-key.news-from-ai}")
    private String newsFromAiRoutingKey;

    public void sendToWorldService(NewsMessage newsMessage) {
        try {
            log.info("📤 Отправка обработанной новости в world-service. ID: {}", newsMessage.getNewsId());

            rabbitTemplate.convertAndSend(
                    newsExchange,
                    newsFromAiRoutingKey,
                    newsMessage
            );

            log.info("✅ Новость отправлена в world-service!");
        } catch (Exception e) {
            log.error("❌ Ошибка отправки: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send to world-service", e);
        }
    }
}