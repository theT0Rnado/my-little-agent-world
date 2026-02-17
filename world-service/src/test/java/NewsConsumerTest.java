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

@ExtendWith(MockitoExtension.class)
class NewsServiceTest {

    @Mock
    private NewsRepository newsRepository;

    @Mock
    private NewsMapper newsMapper;

    @InjectMocks
    private NewsService newsService;

    // ✅ ТЕСТ 1: Сохранение вызывает репозиторий
    @Test
    void saveNewsFromAi_shouldCallRepository() {
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

        newsService.saveNewsFromAi(message);

        verify(newsRepository, times(1)).save(news);
        verify(newsMapper, times(1)).toEntity(message);
    }

    // ✅ ТЕСТ 2: Получение всех новостей — возвращает правильный размер списка
    @Test
    void getAllNews_shouldReturnCorrectSize() {
        News news1 = News.builder().id(1L).content("Новость 1").status(News.NewsStatus.PROCESSED).createdAt(LocalDateTime.now()).build();
        News news2 = News.builder().id(2L).content("Новость 2").status(News.NewsStatus.PROCESSED).createdAt(LocalDateTime.now()).build();
        News news3 = News.builder().id(3L).content("Новость 3").status(News.NewsStatus.PROCESSED).createdAt(LocalDateTime.now()).build();

        NewsDto dto1 = NewsDto.builder().id(1L).content("Новость 1").status("PROCESSED").build();
        NewsDto dto2 = NewsDto.builder().id(2L).content("Новость 2").status("PROCESSED").build();
        NewsDto dto3 = NewsDto.builder().id(3L).content("Новость 3").status("PROCESSED").build();

        when(newsRepository.findAll()).thenReturn(List.of(news1, news2, news3));
        when(newsMapper.toDto(news1)).thenReturn(dto1);
        when(newsMapper.toDto(news2)).thenReturn(dto2);
        when(newsMapper.toDto(news3)).thenReturn(dto3);

        List<NewsDto> result = newsService.getAllNews();

        assertEquals(3, result.size());
    }

    // ✅ ТЕСТ 3: Пустой список если новостей нет
    @Test
    void getAllNews_shouldReturnEmptyList_whenNoNews() {
        when(newsRepository.findAll()).thenReturn(List.of());

        List<NewsDto> result = newsService.getAllNews();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(newsRepository, times(1)).findAll();
    }

    // ✅ ТЕСТ 4: Получение по ID — новость найдена
    @Test
    void getNewsById_shouldReturnCorrectNews() {
        Long id = 5L;

        News news = News.builder()
                .id(id)
                .content("Нужная новость")
                .status(News.NewsStatus.PROCESSED)
                .build();

        NewsDto dto = NewsDto.builder()
                .id(id)
                .content("Нужная новость")
                .status("PROCESSED")
                .build();

        when(newsRepository.findById(id)).thenReturn(Optional.of(news));
        when(newsMapper.toDto(news)).thenReturn(dto);

        NewsDto result = newsService.getNewsById(id);

        assertNotNull(result);
        assertEquals(id, result.getId());
        assertEquals("Нужная новость", result.getContent());
        assertEquals("PROCESSED", result.getStatus());
    }

    // ✅ ТЕСТ 5: Получение по ID — новость не найдена, бросает исключение
    @Test
    void getNewsById_shouldThrowException_whenNotFound() {
        Long id = 999L;
        when(newsRepository.findById(id)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> newsService.getNewsById(id)
        );

        assertTrue(exception.getMessage().contains("999"));
        verify(newsRepository, times(1)).findById(id);
    }

    // ✅ ТЕСТ 6: getAllNews вызывает findAll ровно 1 раз
    @Test
    void getAllNews_shouldCallFindAllOnce() {
        when(newsRepository.findAll()).thenReturn(List.of());

        newsService.getAllNews();

        verify(newsRepository, times(1)).findAll();
        verifyNoMoreInteractions(newsRepository);
    }

    // ✅ ТЕСТ 7: Сохранение с пустым content
    @Test
    void saveNewsFromAi_shouldSave_evenWithEmptyContent() {
        NewsMessage message = NewsMessage.builder()
                .newsId(2L)
                .content("")
                .build();

        News news = News.builder()
                .content("")
                .status(News.NewsStatus.PROCESSED)
                .build();

        when(newsMapper.toEntity(message)).thenReturn(news);
        when(newsRepository.save(news)).thenReturn(news);

        newsService.saveNewsFromAi(message);

        verify(newsRepository, times(1)).save(any(News.class));
    }

    // ✅ ТЕСТ 8: getNewsById не вызывает mapper если новость не найдена
    @Test
    void getNewsById_shouldNotCallMapper_whenNotFound() {
        when(newsRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> newsService.getNewsById(1L));

        verifyNoInteractions(newsMapper);
    }

    // ✅ ТЕСТ 9: getAllNews правильно преобразует каждую новость через mapper
    @Test
    void getAllNews_shouldMapEachNewsToDto() {
        News news1 = News.builder().id(1L).content("A").status(News.NewsStatus.PROCESSED).createdAt(LocalDateTime.now()).build();
        News news2 = News.builder().id(2L).content("B").status(News.NewsStatus.PROCESSED).createdAt(LocalDateTime.now()).build();

        NewsDto dto1 = NewsDto.builder().id(1L).content("A").status("PROCESSED").build();
        NewsDto dto2 = NewsDto.builder().id(2L).content("B").status("PROCESSED").build();

        when(newsRepository.findAll()).thenReturn(List.of(news1, news2));
        when(newsMapper.toDto(news1)).thenReturn(dto1);
        when(newsMapper.toDto(news2)).thenReturn(dto2);

        newsService.getAllNews();

        // Проверяем что mapper был вызван для каждой новости
        verify(newsMapper, times(1)).toDto(news1);
        verify(newsMapper, times(1)).toDto(news2);
    }
}