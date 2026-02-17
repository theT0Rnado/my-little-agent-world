package com.thet0rnado.mylittleagentworld.world.service;

import com.thet0rnado.mylittleagentworld.world.dto.NewsDto;
import com.thet0rnado.mylittleagentworld.world.dto.NewsMessage;
import com.thet0rnado.mylittleagentworld.world.entity.News;
import com.thet0rnado.mylittleagentworld.world.mapper.NewsMapper;
import com.thet0rnado.mylittleagentworld.world.repository.NewsRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NewsServiceTest {

    @Mock
    private NewsRepository newsRepository;

    @Mock
    private NewsMapper newsMapper;

    @InjectMocks
    private NewsService newsService;

    @Test
    void saveNewsFromAi_shouldSaveNews() {
        // GIVEN
        NewsMessage message = NewsMessage.builder()
                .newsId(1L)
                .content("Тестовая новость")
                .build();

        News news = News.builder()
                .content("Тестовая новость")
                .status(News.NewsStatus.PROCESSED)
                .build();

        when(newsMapper.toEntity(message)).thenReturn(news);
        when(newsRepository.save(news)).thenReturn(news);

        // WHEN
        newsService.saveNewsFromAi(message);

        // THEN
        verify(newsRepository, times(1)).save(news);
    }

    @Test
    void getAllNews_shouldReturnListOfNews() {
        // GIVEN
        News news1 = News.builder()
                .id(1L)
                .content("Первая новость")
                .status(News.NewsStatus.PROCESSED)
                .createdAt(LocalDateTime.now())
                .build();

        NewsDto dto1 = NewsDto.builder()
                .id(1L)
                .content("Первая новость")
                .status("PROCESSED")
                .build();

        when(newsRepository.findAll()).thenReturn(List.of(news1));
        when(newsMapper.toDto(news1)).thenReturn(dto1);

        // WHEN
        List<NewsDto> result = newsService.getAllNews();

        // THEN
        assertEquals(1, result.size());
        assertEquals("Первая новость", result.get(0).getContent());
    }

    @Test
    void getNewsById_shouldReturnNews_whenExists() {
        // GIVEN
        Long id = 1L;
        News news = News.builder()
                .id(id)
                .content("Тестовая новость")
                .status(News.NewsStatus.PROCESSED)
                .build();

        NewsDto dto = NewsDto.builder()
                .id(id)
                .content("Тестовая новость")
                .status("PROCESSED")
                .build();

        when(newsRepository.findById(id)).thenReturn(Optional.of(news));
        when(newsMapper.toDto(news)).thenReturn(dto);

        // WHEN
        NewsDto result = newsService.getNewsById(id);

        // THEN
        assertNotNull(result);
        assertEquals("Тестовая новость", result.getContent());
    }
}
