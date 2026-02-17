package com.thet0rnado.mylittleagentworld.world;

import com.thet0rnado.mylittleagentworld.world.dto.NewsDto;
import com.thet0rnado.mylittleagentworld.world.dto.NewsMessage;
import com.thet0rnado.mylittleagentworld.world.entity.News;
import com.thet0rnado.mylittleagentworld.world.mapper.NewsMapper;
import com.thet0rnado.mylittleagentworld.world.repository.NewsRepository;
import com.thet0rnado.mylittleagentworld.world.service.NewsService;
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

@ExtendWith(MockitoExtension.class)  // Подключаем Mockito
class NewsServiceTest {

    @Mock
    private NewsRepository newsRepository;  // Подменяем реальный репозиторий

    @Mock
    private NewsMapper newsMapper;          // Подменяем реальный маппер

    @InjectMocks
    private NewsService newsService;        // Сюда внедряются моки

    // ✅ ТЕСТ 1: Сохранение новости от AI
    @Test
    void saveNewsFromAi_shouldSaveNews() {
        // GIVEN - подготавливаем данные
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

        // WHEN - вызываем метод
        newsService.saveNewsFromAi(message);

        // THEN - проверяем что save был вызван 1 раз
        verify(newsRepository, times(1)).save(news);
    }

    // ✅ ТЕСТ 2: Получение всех новостей
    @Test
    void getAllNews_shouldReturnListOfNews() {
        // GIVEN
        News news1 = News.builder()
                .id(1L)
                .content("Первая новость")
                .status(News.NewsStatus.PROCESSED)
                .createdAt(LocalDateTime.now())
                .build();

        News news2 = News.builder()
                .id(2L)
                .content("Вторая новость")
                .status(News.NewsStatus.PROCESSED)
                .createdAt(LocalDateTime.now())
                .build();

        NewsDto dto1 = NewsDto.builder()
                .id(1L)
                .content("Первая новость")
                .status("PROCESSED")
                .build();

        NewsDto dto2 = NewsDto.builder()
                .id(2L)
                .content("Вторая новость")
                .status("PROCESSED")
                .build();

        when(newsRepository.findAll()).thenReturn(List.of(news1, news2));
        when(newsMapper.toDto(news1)).thenReturn(dto1);
        when(newsMapper.toDto(news2)).thenReturn(dto2);

        // WHEN
        List<NewsDto> result = newsService.getAllNews();

        // THEN
        assertEquals(2, result.size());
        assertEquals("Первая новость", result.get(0).getContent());
        assertEquals("Вторая новость", result.get(1).getContent());
        verify(newsRepository, times(1)).findAll();
    }

    // ✅ ТЕСТ 3: Получение новости по ID — успешно
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
        assertEquals(id, result.getId());
        assertEquals("Тестовая новость", result.getContent());
    }

    // ✅ ТЕСТ 4: Получение новости по ID — не найдена
    @Test
    void getNewsById_shouldThrowException_whenNotFound() {
        // GIVEN
        Long id = 999L;
        when(newsRepository.findById(id)).thenReturn(Optional.empty());

        // WHEN + THEN
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> newsService.getNewsById(id)
        );

        assertTrue(exception.getMessage().contains("999"));
    }

    // ✅ ТЕСТ 5: Пустой список новостей
    @Test
    void getAllNews_shouldReturnEmptyList_whenNoNews() {
        // GIVEN
        when(newsRepository.findAll()).thenReturn(List.of());

        // WHEN
        List<NewsDto> result = newsService.getAllNews();

        // THEN
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // ✅ ТЕСТ 6: Сохранение устанавливает статус PROCESSED
    @Test
    void saveNewsFromAi_shouldSetStatusProcessed() {
        // GIVEN
        NewsMessage message = NewsMessage.builder()
                .newsId(1L)
                .content("Новость от AI")
                .build();

        News news = News.builder()
                .content("Новость от AI")
                .status(News.NewsStatus.PROCESSED)
                .build();

        when(newsMapper.toEntity(message)).thenReturn(news);
        when(newsRepository.save(any(News.class))).thenReturn(news);

        // WHEN
        newsService.saveNewsFromAi(message);

        // THEN
        assertEquals(News.NewsStatus.PROCESSED, news.getStatus());
        verify(newsRepository, times(1)).save(any(News.class));
    }
}