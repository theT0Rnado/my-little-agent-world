package com.thet0rnado.mylittleagentworld.world.messaging;

import com.thet0rnado.mylittleagentworld.world.dto.ConversationResultDto;  // ← из dto!
import com.thet0rnado.mylittleagentworld.world.service.ConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ConversationConsumer {

    private final ConversationService conversationService;

    @RabbitListener(queues = "${rabbitmq.queue.conversation}")
    public void receiveConversation(ConversationResultDto result) {
        log.info("📨 Получен разговор: {}", result.getTopic());
        conversationService.saveConversation(result);
    }
}