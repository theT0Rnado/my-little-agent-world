package com.thet0rnado.mylittleagentworld.world.messaging;

import com.thet0rnado.mylittleagentworld.world.dto.NewsMessage;
import com.thet0rnado.mylittleagentworld.world.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NewsConsumer {

    private final NewsService newsService;

    @RabbitListener(queues = "${rabbitmq.queue.news-from-ai}")
    public void receiveNewsFromAi(NewsMessage newsMessage) {
        log.info("📨 Получена новость от AI: {}", newsMessage.getNewsId());
        try {
            newsService.saveNewsFromAi(newsMessage);
        } catch (Exception e) {
            log.error("❌ Ошибка сохранения: {}", e.getMessage(), e);
        }
    }
}