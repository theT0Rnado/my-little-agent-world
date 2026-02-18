package com.thet0rnado.mylittleagentworld.ai.agent;

import com.thet0rnado.mylittleagentworld.ai.dto.AgentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SummarizerAgent {

    public AgentResponse summarize(String newsContent) {
        log.info("📝 Summarizer Agent начинает суммаризацию (MOCK режим)...");
        long startTime = System.currentTimeMillis();

        // Имитация работы AI (задержка)
        try {
            Thread.sleep(700);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // MOCK логика создания резюме
        String summary = createSummary(newsContent);

        long duration = System.currentTimeMillis() - startTime;

        log.info("✅ Summarizer: резюме создано, время = {}ms", duration);

        return AgentResponse.builder()
                .agentName("Summarizer")
                .response(summary)
                .processingTimeMs(duration)
                .build();
    }

    private String createSummary(String content) {
        // Извлекаем ключевые слова
        String[] words = content.split("\\s+");

        if (words.length <= 10) {
            return "Краткое содержание: " + content;
        }

        // Берём первые 10 слов + "..."
        StringBuilder summary = new StringBuilder("Краткое содержание: ");
        for (int i = 0; i < Math.min(10, words.length); i++) {
            summary.append(words[i]).append(" ");
        }
        summary.append("...");

        // Добавляем статистику
        summary.append(String.format(" (Оригинал: %d слов)", words.length));

        return summary.toString();
    }
}