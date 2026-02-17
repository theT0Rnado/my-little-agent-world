package com.thet0rnado.mylittleagentworld.world.messaging;

import com.thet0rnado.mylittleagentworld.world.dto.NewsMessage;
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

    @Value("${rabbitmq.routing-key.news-to-ai}")
    private String newsToAiRoutingKey;

    public void sendNewsToAiService(NewsMessage newsMessage) {
        try {
            log.info("Sending news to AI service. News ID: {}, Title: {}",
                    newsMessage.getNewsId());

            rabbitTemplate.convertAndSend(
                    newsExchange,
                    newsToAiRoutingKey,
                    newsMessage
            );

            log.info("News successfully sent to queue. News ID: {}", newsMessage.getNewsId());
        } catch (Exception e) {
            log.error("Error sending news to queue. News ID: {}, Error: {}",
                    newsMessage.getNewsId(), e.getMessage(), e);
            throw new RuntimeException("Failed to send news to RabbitMQ", e);
        }
    }
}