package com.thet0rnado.mylittleagentworld.world.service;

import com.thet0rnado.mylittleagentworld.world.dto.NewsDto;
import com.thet0rnado.mylittleagentworld.world.dto.NewsMessage;
import com.thet0rnado.mylittleagentworld.world.entity.News;
import com.thet0rnado.mylittleagentworld.world.mapper.NewsMapper;
import com.thet0rnado.mylittleagentworld.world.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;
    private final NewsMapper newsMapper;

    // Получили новость от ai-service → сохраняем в БД
    @Transactional
    public void saveNewsFromAi(NewsMessage message) {
        log.info("💾 Сохранение новости от AI. ID: {}", message.getNewsId());
        News news = newsMapper.toEntity(message);
        newsRepository.save(news);
        log.info("✅ Новость сохранена!");
    }

    // Отдаём все новости фронту
    @Transactional(readOnly = true)
    public List<NewsDto> getAllNews() {
        return newsRepository.findAll().stream()
                .map(newsMapper::toDto)
                .collect(Collectors.toList());
    }

    // Отдаём новость по ID фронту
    @Transactional(readOnly = true)
    public NewsDto getNewsById(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Новость не найдена: " + id));
        return newsMapper.toDto(news);
    }
}