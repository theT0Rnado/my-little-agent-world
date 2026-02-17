package com.thet0rnado.mylittleagentworld.world.controller;

import com.thet0rnado.mylittleagentworld.world.dto.NewsDto;
import com.thet0rnado.mylittleagentworld.world.entity.News;
import com.thet0rnado.mylittleagentworld.world.service.NewsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @PostMapping
    public ResponseEntity<NewsDto> receiveNews(@Valid @RequestBody NewsDto newsDto) {
        log.info("🌐 POST /api/v1/news - Получен запрос на создание новости: {}", newsDto.getTitle());
        NewsDto savedNews = newsService.receiveAndSaveNews(newsDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedNews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsDto> getNewsById(@PathVariable Long id) {
        log.info("🌐 GET /api/v1/news/{} - Запрос новости", id);
        NewsDto news = newsService.getNewsById(id);
        return ResponseEntity.ok(news);
    }


    @GetMapping
    public ResponseEntity<List<NewsDto>> getAllNews() {
        log.info("🌐 GET /api/v1/news - Запрос всех новостей");
        List<NewsDto> newsList = newsService.getAllNews();
        return ResponseEntity.ok(newsList);
    }


    @GetMapping("/status/{status}")
    public ResponseEntity<List<NewsDto>> getNewsByStatus(@PathVariable String status) {
        log.info("🌐 GET /api/v1/news/status/{}", status);
        News.NewsStatus newsStatus = News.NewsStatus.valueOf(status.toUpperCase());
        List<NewsDto> newsList = newsService.getNewsByStatus(newsStatus);
        return ResponseEntity.ok(newsList);
    }


    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateNewsStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        log.info("🌐 PATCH /api/v1/news/{}/status - Обновление статуса на {}", id, status);
        News.NewsStatus newsStatus = News.NewsStatus.valueOf(status.toUpperCase());
        newsService.updateNewsStatus(id, newsStatus);
        return ResponseEntity.noContent().build();
    }
}
