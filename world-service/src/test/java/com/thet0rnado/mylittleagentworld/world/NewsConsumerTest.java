package com.thet0rnado.mylittleagentworld.world;

import com.thet0rnado.mylittleagentworld.world.dto.NewsMessage;
import com.thet0rnado.mylittleagentworld.world.messaging.NewsConsumer;
import com.thet0rnado.mylittleagentworld.world.service.NewsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NewsConsumerTest {

    @Mock
    private NewsService newsService;

    @InjectMocks
    private NewsConsumer newsConsumer;

    // ✅ ТЕСТ 1: Consumer успешно получает и сохраняет новость
    @Test
    void receiveNewsFromAi_shouldCallSaveNewsFromAi() {
        // GIVEN
        NewsMessage message = NewsMessage.builder()
                .newsId(1L)
                .content("Новость от AI")
                .build();

        // WHEN
        newsConsumer.receiveNewsFromAi(message);

        // THEN - проверяем что сервис был вызван
        verify(newsService, times(1)).saveNewsFromAi(message);
    }

    // ✅ ТЕСТ 2: Consumer не падает если сервис выбросил ошибку
    @Test
    void receiveNewsFromAi_shouldNotThrow_whenServiceFails() {
        // GIVEN
        NewsMessage message = NewsMessage.builder()
                .newsId(1L)
                .content("Проблемная новость")
                .build();

        doThrow(new RuntimeException("Ошибка БД"))
                .when(newsService).saveNewsFromAi(message);

        // WHEN + THEN — не должно выбросить исключение
        assertDoesNotThrow(() -> newsConsumer.receiveNewsFromAi(message));
    }
}