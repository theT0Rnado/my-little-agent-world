package com.thet0rnado.mylittleagentworld.world.service;

import com.thet0rnado.mylittleagentworld.world.dto.ConversationResultDto;
import com.thet0rnado.mylittleagentworld.world.entity.Conversation;
import com.thet0rnado.mylittleagentworld.world.entity.ConversationMessage;
import com.thet0rnado.mylittleagentworld.world.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;

    @Transactional
    public void saveConversation(ConversationResultDto dto) {
        log.info("💾 Сохраняем разговор на тему: {}", dto.getTopic());

        Conversation conversation = Conversation.builder()
                .topic(dto.getTopic())
                .topicDisplayName(dto.getTopicDisplayName())
                .alphaFinalMood(dto.getAlphaFinalMood())
                .betaFinalMood(dto.getBetaFinalMood())
                .gammaFinalMood(dto.getGammaFinalMood())
                .build();

        Conversation saved = conversationRepository.save(conversation);

        List<ConversationMessage> messages = dto.getMessages().stream()
                .map(m -> ConversationMessage.builder()
                        .agentName(m.getAgentName())
                        .mood(m.getMood())
                        .moodEmoji(m.getMoodEmoji())
                        .moodLevel(m.getMoodLevel())
                        .text(m.getText())
                        .conversation(saved)
                        .build())
                .collect(Collectors.toList());

        saved.setMessages(messages);
        conversationRepository.save(saved);
        log.info("✅ Разговор сохранён с ID: {}", saved.getId());
    }

    public List<Conversation> getAll() {
        return conversationRepository.findAllByOrderByCreatedAtDesc();
    }

    public Conversation getById(Long id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Разговор не найден: " + id));
    }
}