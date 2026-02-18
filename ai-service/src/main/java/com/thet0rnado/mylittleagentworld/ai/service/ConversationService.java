package com.thet0rnado.mylittleagentworld.ai.service;

import com.thet0rnado.mylittleagentworld.ai.dto.ConversationResultDto;
import com.thet0rnado.mylittleagentworld.ai.dto.MessageDto;
import com.thet0rnado.mylittleagentworld.ai.model.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class ConversationService {

    // Состояние агентов накапливается между разговорами!
    private final Agent alpha = Agent.builder()
            .name("Alpha").moodLevel(60).personality("оптимист").build();

    private final Agent beta = Agent.builder()
            .name("Beta").moodLevel(60).personality("скептик").build();

    private final Agent gamma = Agent.builder()
            .name("Gamma").moodLevel(60).personality("философ").build();

    // ─── Разговор по теме (кнопки в сайдбаре) ────────────────────────────────
    public ConversationResultDto generateConversation(String topicName) {
        ConversationTopic topic = ConversationTopic.valueOf(topicName);

        log.info("🎭 Тема: {} | Alpha: {} Beta: {} Gamma: {}",
                topic.getDisplayName(),
                alpha.getMoodLevel(), beta.getMoodLevel(), gamma.getMoodLevel());

        // Применяем эффект темы
        alpha.applyTopicEffect(topic.getMoodDelta());
        beta.applyTopicEffect(topic.getMoodDelta());
        gamma.applyTopicEffect(topic.getMoodDelta());

        String[] context = AgentPhrases.CONTEXT.get(topic);
        List<MessageDto> messages = new ArrayList<>();

        // Раунд 1: контекстная фраза от каждого
        messages.add(buildMessage(alpha, AgentPhrases.ALPHA, context, 0));
        messages.add(buildMessage(beta,  AgentPhrases.BETA,  context, 1));
        messages.add(buildMessage(gamma, AgentPhrases.GAMMA, context, 0));

        // Раунд 2: реакция на разговор
        messages.add(buildMessage(alpha, AgentPhrases.ALPHA, AgentPhrases.ALPHA.get(alpha.getMood()), 1));
        messages.add(buildMessage(beta,  AgentPhrases.BETA,  AgentPhrases.BETA.get(beta.getMood()),   2));
        messages.add(buildMessage(gamma, AgentPhrases.GAMMA, AgentPhrases.GAMMA.get(gamma.getMood()), 1));

        log.info("✅ Диалог создан. Alpha: {}({}) Beta: {}({}) Gamma: {}({})",
                alpha.getMoodLevel(), alpha.getMood(),
                beta.getMoodLevel(), beta.getMood(),
                gamma.getMoodLevel(), gamma.getMood());

        return ConversationResultDto.builder()
                .topic(topic.name())
                .topicDisplayName(topic.getDisplayName())
                .messages(messages)
                .alphaFinalMood(alpha.getMoodLevel())
                .betaFinalMood(beta.getMoodLevel())
                .gammaFinalMood(gamma.getMoodLevel())
                .build();
    }

    // ─── Реакция на новость от пользователя ──────────────────────────────────
    public ConversationResultDto processNewsAndChat(String newsContent) {
        // Определяем тональность текста
        int moodDelta = analyzeSentiment(newsContent);

        log.info("📰 Новость: '{}' | Тональность: {}", newsContent, moodDelta > 0 ? "+" + moodDelta : moodDelta);
        log.info("📊 До: Alpha: {} Beta: {} Gamma: {}",
                alpha.getMoodLevel(), beta.getMoodLevel(), gamma.getMoodLevel());

        // Применяем к агентам
        alpha.applyTopicEffect(moodDelta);
        beta.applyTopicEffect(moodDelta);
        gamma.applyTopicEffect(moodDelta);

        log.info("📊 После: Alpha: {}({}) Beta: {}({}) Gamma: {}({})",
                alpha.getMoodLevel(), alpha.getMood(),
                beta.getMoodLevel(), beta.getMood(),
                gamma.getMoodLevel(), gamma.getMood());

        // Генерируем реакцию агентов на новость
        List<MessageDto> messages = new ArrayList<>();

        // Alpha первым реагирует на новость
        messages.add(buildMessage(alpha, AgentPhrases.ALPHA,
                new String[]{"Слышали? " + newsContent}, 0));

        // Beta и Gamma реагируют исходя из настроения
        messages.add(buildMessage(beta,  AgentPhrases.BETA,
                AgentPhrases.BETA.get(beta.getMood()), 0));
        messages.add(buildMessage(gamma, AgentPhrases.GAMMA,
                AgentPhrases.GAMMA.get(gamma.getMood()), 0));

        // Второй раунд — обсуждение
        messages.add(buildMessage(alpha, AgentPhrases.ALPHA,
                AgentPhrases.ALPHA.get(alpha.getMood()), 1));
        messages.add(buildMessage(beta,  AgentPhrases.BETA,
                AgentPhrases.BETA.get(beta.getMood()), 1));
        messages.add(buildMessage(gamma, AgentPhrases.GAMMA,
                AgentPhrases.GAMMA.get(gamma.getMood()), 1));

        String displayName = newsContent.length() > 40
                ? newsContent.substring(0, 40) + "..."
                : newsContent;

        return ConversationResultDto.builder()
                .topic("NEWS")
                .topicDisplayName(displayName)
                .messages(messages)
                .alphaFinalMood(alpha.getMoodLevel())
                .betaFinalMood(beta.getMoodLevel())
                .gammaFinalMood(gamma.getMoodLevel())
                .build();
    }

    // ─── Анализ тональности текста ────────────────────────────────────────────
    private int analyzeSentiment(String text) {
        String lower = text.toLowerCase();

        long positive = java.util.Arrays.stream(new String[]{
                "выиграл", "победа", "успех", "отлично", "замечательно",
                "открыли", "достижение", "рекорд", "рост", "прорыв",
                "хорошо", "радость", "счастье", "любовь", "мир",
                "запустили", "спасли", "построили", "помогли", "выпустили"
        }).filter(lower::contains).count();

        long negative = java.util.Arrays.stream(new String[]{
                "катастрофа", "авария", "смерть", "война", "кризис",
                "провал", "упал", "потерял", "плохо", "ужасно",
                "взрыв", "трагедия", "убыток", "скандал", "крах",
                "уволили", "закрыли", "сгорел", "затопило", "обрушился"
        }).filter(lower::contains).count();

        if (positive > negative) return (int) (positive * 8);
        if (negative > positive) return (int) -(negative * 8);
        return 0;
    }

    // ─── Вспомогательный метод ────────────────────────────────────────────────
    private MessageDto buildMessage(Agent agent, java.util.Map<AgentMood, String[]> phrases,
                                    String[] lines, int index) {
        String[] available = lines != null && lines.length > 0
                ? lines
                : phrases.get(agent.getMood());

        String text = available[index % available.length];

        return MessageDto.builder()
                .agentName(agent.getName())
                .mood(agent.getMood().name())
                .moodEmoji(agent.getMoodEmoji())
                .moodLevel(agent.getMoodLevel())
                .text(text)
                .build();
    }
}