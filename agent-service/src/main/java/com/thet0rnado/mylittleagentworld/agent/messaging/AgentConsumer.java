package com.thet0rnado.mylittleagentworld.agent.messaging;

import com.thet0rnado.mylittleagentworld.agent.dto.AgentListFromAiMessage;
import com.thet0rnado.mylittleagentworld.agent.dto.AgentMessageTextMessage;
import com.thet0rnado.mylittleagentworld.agent.service.AgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AgentConsumer {

    private AgentService agentService;
    private AgentProducer agentProducer;

    @RabbitListener(queues = "${rabbitmq.queue.agent-all-agent-data-from-ai}")
    public void startCreatingAgents(AgentListFromAiMessage message) {
        log.info("📨 Получен список агентов от AI: {} агентов",
                message.getAgents() != null ? message.getAgents().size() : 0);
        try {
            agentService.createAgents(message);
        } catch (Exception e) {
            log.error("❌ Ошибка обработки списка агентов: {}", e.getMessage(), e);
        }
    }

    @RabbitListener(queues = "${rabbitmq.queue.agent-message-from-ai}")
    private void setMessageToAgent(AgentMessageTextMessage message) {

    }

}