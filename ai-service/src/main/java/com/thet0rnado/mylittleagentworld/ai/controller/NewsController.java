package com.thet0rnado.mylittleagentworld.ai.controller;

import com.thet0rnado.mylittleagentworld.ai.dto.NewsMessage;
import com.thet0rnado.mylittleagentworld.ai.messaging.NewsProducer;
import com.thet0rnado.mylittleagentworld.ai.service.AiProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {

    private final AiProcessingService aiProcessingService;
    private final NewsProducer newsProducer;

    /**
     * Endpoint для фронта - принимает новость напрямую
     */
    @PostMapping
    public ResponseEntity<String> receiveNews(@RequestBody NewsMessage news) {
        log.info("📥 Получена новость от фронта через HTTP");

        // Генерируем ID если нет
        if (news.getNewsId() == null) {
            news.setNewsId(System.currentTimeMillis());
        }

        // Обрабатываем
        NewsMessage processed = aiProcessingService.processNews(news);

        // Отправляем в world-service
        newsProducer.sendToWorldService(processed);

        return ResponseEntity.ok("Новость обработана и отправлена в world-service");
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("AI Service is running");
    }
}
