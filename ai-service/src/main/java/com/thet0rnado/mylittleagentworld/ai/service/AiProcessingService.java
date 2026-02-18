package com.thet0rnado.mylittleagentworld.ai.service;

import com.thet0rnado.mylittleagentworld.ai.agent.AnalyzerAgent;
import com.thet0rnado.mylittleagentworld.ai.agent.SummarizerAgent;
import com.thet0rnado.mylittleagentworld.ai.dto.AgentResponse;
import com.thet0rnado.mylittleagentworld.ai.dto.NewsMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiProcessingService {

    private final AnalyzerAgent analyzerAgent;
    private final SummarizerAgent summarizerAgent;

    public NewsMessage processNews(NewsMessage news) {
        log.info("🤖 Координатор запускает обработку новости ID: {}", news.getNewsId());

        // Агенты работают последовательно (можно сделать параллельно через CompletableFuture)
        AgentResponse sentiment = analyzerAgent.analyze(news.getContent());
        AgentResponse summary = summarizerAgent.summarize(news.getContent());

        // Объединяем результаты работы агентов
        String processedContent = String.format(
                "═══════════════════════════════════════\n" +
                        "📊 МУЛЬТИАГЕНТНЫЙ АНАЛИЗ НОВОСТИ\n" +
                        "═══════════════════════════════════════\n\n" +
                        "🔍 АГЕНТ-АНАЛИТИК (время обработки: %dms)\n" +
                        "   Определённая тональность: %s\n\n" +
                        "📝 АГЕНТ-СУММАРИЗАТОР (время обработки: %dms)\n" +
                        "   %s\n\n" +
                        "───────────────────────────────────────\n" +
                        "📰 ИСХОДНЫЙ ТЕКСТ НОВОСТИ:\n" +
                        "───────────────────────────────────────\n" +
                        "%s\n" +
                        "═══════════════════════════════════════\n" +
                        "⏱️ Общее время обработки: %dms\n" +
                        "✅ Статус: Обработано успешно",
                sentiment.getProcessingTimeMs(),
                sentiment.getResponse(),
                summary.getProcessingTimeMs(),
                summary.getResponse(),
                news.getContent(),
                sentiment.getProcessingTimeMs() + summary.getProcessingTimeMs()
        );

        NewsMessage processed = NewsMessage.builder()
                .newsId(news.getNewsId())
                .content(processedContent)
                .build();

        log.info("✅ Обработка завершена. Общее время: {}ms",
                sentiment.getProcessingTimeMs() + summary.getProcessingTimeMs());

        return processed;
    }
}