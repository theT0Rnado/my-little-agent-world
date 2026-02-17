package com.thet0rnado.mylittleagentworld.world.controller;

import com.thet0rnado.mylittleagentworld.world.dto.NewsDto;
import com.thet0rnado.mylittleagentworld.world.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    // GET /api/v1/news — все новости для фронта
    @GetMapping
    public ResponseEntity<List<NewsDto>> getAllNews() {
        log.info("📋 Запрос всех новостей");
        return ResponseEntity.ok(newsService.getAllNews());
    }

    // GET /api/v1/news/1 — новость по ID
    @GetMapping("/{id}")
    public ResponseEntity<NewsDto> getNewsById(@PathVariable Long id) {
        log.info("🔍 Запрос новости ID: {}", id);
        return ResponseEntity.ok(newsService.getNewsById(id));
    }
}