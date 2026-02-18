package com.thet0rnado.mylittleagentworld.ai.controller;

import com.thet0rnado.mylittleagentworld.ai.dto.ConversationResultDto;
import com.thet0rnado.mylittleagentworld.ai.messaging.ConversationProducer;
import com.thet0rnado.mylittleagentworld.ai.model.ConversationTopic;
import com.thet0rnado.mylittleagentworld.ai.service.ConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/conversation")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final ConversationProducer conversationProducer;

    @PostMapping
    public ResponseEntity<ConversationResultDto> startConversation(@RequestParam String topic) {
        log.info("🎭 Запрос разговора: {}", topic);
        ConversationResultDto result = conversationService.generateConversation(topic);
        conversationProducer.sendConversation(result);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TopicInfo>> getTopics() {
        List<TopicInfo> topics = Arrays.stream(ConversationTopic.values())
                .map(t -> new TopicInfo(t.name(), t.getDisplayName(), t.getMoodDelta()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(topics);
    }

    @PostMapping("/react-to-news")
    public ResponseEntity<ConversationResultDto> reactToNews(
            @RequestBody java.util.Map<String, String> body) {
        String content = body.get("content");
        log.info("📰 Агенты реагируют на новость: {}", content);
        ConversationResultDto result = conversationService.processNewsAndChat(content);
        conversationProducer.sendConversation(result);
        return ResponseEntity.ok(result);
    }

    public record TopicInfo(String key, String displayName, int moodEffect) {}
}