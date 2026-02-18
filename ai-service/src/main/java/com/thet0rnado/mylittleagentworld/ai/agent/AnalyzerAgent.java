package com.thet0rnado.mylittleagentworld.ai.agent;

import com.thet0rnado.mylittleagentworld.ai.dto.AgentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AnalyzerAgent {

    public AgentResponse analyze(String newsContent) {
        log.info("🔍 Analyzer Agent начинает анализ (MOCK режим)...");
        long startTime = System.currentTimeMillis();

        // Имитация работы AI (задержка)
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // MOCK логика определения тональности
        String sentiment = determineSentiment(newsContent);

        long duration = System.currentTimeMillis() - startTime;

        log.info("✅ Analyzer: тональность = {}, время = {}ms", sentiment, duration);

        return AgentResponse.builder()
                .agentName("Analyzer")
                .response(sentiment)
                .processingTimeMs(duration)
                .build();
    }

    private String determineSentiment(String content) {
        String lowerContent = content.toLowerCase();

        // Позитивные слова
        if (lowerContent.contains("выиграл") ||
                lowerContent.contains("успех") ||
                lowerContent.contains("новый") ||
                lowerContent.contains("революционный") ||
                lowerContent.contains("прорыв") ||
                lowerContent.contains("достижение") ||
                lowerContent.contains("победа")) {
            return "POSITIVE";
        }

        // Негативные слова
        if (lowerContent.contains("провал") ||
                lowerContent.contains("проигра") ||
                lowerContent.contains("кризис") ||
                lowerContent.contains("катастрофа") ||
                lowerContent.contains("падение") ||
                lowerContent.contains("убыток") ||
                lowerContent.contains("авария")) {
            return "NEGATIVE";
        }

        // Нейтральные
        return "NEUTRAL";
    }
}