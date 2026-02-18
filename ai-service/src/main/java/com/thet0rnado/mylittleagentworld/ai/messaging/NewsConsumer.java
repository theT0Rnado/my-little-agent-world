package com.thet0rnado.mylittleagentworld.ai.messaging;

import com.thet0rnado.mylittleagentworld.ai.dto.NewsMessage;
import com.thet0rnado.mylittleagentworld.ai.service.AiProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NewsConsumer {

    private final AiProcessingService aiProcessingService;
    private final NewsProducer newsProducer;

    @RabbitListener(queues = "${rabbitmq.queue.news-to-ai}")
    public void receiveNewsFromFront(NewsMessage newsMessage) {
        log.info("📨 Получена новость от фронта. ID: {}", newsMessage.getNewsId());

        try {
            // Обрабатываем через "AI"
            NewsMessage processed = aiProcessingService.processNews(newsMessage);

            // Отправляем в world-service
            newsProducer.sendToWorldService(processed);

        } catch (Exception e) {
            log.error("❌ Ошибка обработки: {}", e.getMessage(), e);
        }
    }
}