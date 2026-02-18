package com.thet0rnado.mylittleagentworld.agent.messaging;

import com.thet0rnado.mylittleagentworld.agent.dto.AgentListFromAiMessage;
import com.thet0rnado.mylittleagentworld.agent.dto.AgentMessageTextMessage;
import com.thet0rnado.mylittleagentworld.agent.entity.agent.Agent;
import com.thet0rnado.mylittleagentworld.agent.mapper.MessageMapper;
import com.thet0rnado.mylittleagentworld.agent.service.AgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AgentConsumer {

    private final AgentService agentService;
    private final AgentProducer agentProducer;
    private final MessageMapper messageMapper;

    @RabbitListener(queues = "${rabbitmq.queue.agent-all-agent-data-from-ai}")
    public void startCreatingAgents(AgentListFromAiMessage message) {
        log.info("📨 Получен список агентов от AI: {} агентов",
                message.getAgents() != null ? message.getAgents().size() : 0);
        try {
            agentService.createAgents(message);

            List<Agent> agents = agentService.getAllAgents();

            for (Agent agent : agents) {
                agentProducer.sendAgentMessageRequestToAi(
                        messageMapper.agentEntityToDto(agent)
                );
            }
        } catch (Exception e) {
            log.error("❌ Ошибка обработки списка агентов: {}", e.getMessage(), e);
        }
    }

    @RabbitListener(queues = "${rabbitmq.queue.agent-message-from-ai}")
    private void setMessageToAgent(AgentMessageTextMessage message) {

    }

}