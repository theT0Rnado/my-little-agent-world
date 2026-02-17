package com.thet0rnado.mylittleagentworld.world.service;

import com.thet0rnado.mylittleagentworld.world.dto.NewsDto;
import com.thet0rnado.mylittleagentworld.world.dto.NewsMessage;
import com.thet0rnado.mylittleagentworld.world.entity.News;
import com.thet0rnado.mylittleagentworld.world.mapper.NewsMapper;
import com.thet0rnado.mylittleagentworld.world.messaging.NewsProducer;
import com.thet0rnado.mylittleagentworld.world.repository.NewsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsRepository newsRepository;
    private final NewsProducer newsProducer;
    private final NewsMapper newsMapper;

    @Transactional
    public NewsDto receiveAndSaveNews(NewsDto newsDto) {
        log.info("Receiving and saving news: {}", newsDto.getTitle());

        // Сохраняем в БД
        News news = newsMapper.toEntity(newsDto);
        News savedNews = newsRepository.save(news);
        log.info("News saved to database with ID: {}", savedNews.getId());

        // Отправляем в RabbitMQ для AI service
        try {
            NewsMessage messageDto = newsMapper.toMessageDto(savedNews);
            newsProducer.sendNewsToAiService(messageDto);

            // Обновляем статус
            savedNews.setStatus(News.NewsStatus.SENT_TO_AI);
            savedNews.setSentToAiAt(LocalDateTime.now());
            newsRepository.save(savedNews);

            log.info("News sent to AI service successfully. ID: {}", savedNews.getId());
        } catch (Exception e) {
            log.error("Failed to send news to AI service. ID: {}", savedNews.getId(), e);
            savedNews.setStatus(News.NewsStatus.FAILED);
            newsRepository.save(savedNews);
            throw e;
        }

        return newsMapper.toDto(savedNews);
    }

    @Transactional(readOnly = true)
    public NewsDto getNewsById(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found with id: " + id));
        return newsMapper.toDto(news);
    }

    @Transactional(readOnly = true)
    public List<NewsDto> getAllNews() {
        return newsRepository.findAll().stream()
                .map(newsMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NewsDto> getNewsByStatus(News.NewsStatus status) {
        return newsRepository.findByStatus(status).stream()
                .map(newsMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateNewsStatus(Long newsId, News.NewsStatus newStatus) {
        News news = newsRepository.findById(newsId)
                .orElseThrow(() -> new RuntimeException("News not found with id: " + newsId));
        news.setStatus(newStatus);
        newsRepository.save(news);
        log.info("News status updated. ID: {}, New status: {}", newsId, newStatus);
    }
}