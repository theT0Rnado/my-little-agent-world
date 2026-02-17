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
    private void startCreatingAgents(AgentListFromAiMessage message) {

    }

    @RabbitListener(queues = "${rabbitmq.queue.agent-message-from-ai}")
    private void setMessageToAgent(AgentMessageTextMessage message) {

    }

}