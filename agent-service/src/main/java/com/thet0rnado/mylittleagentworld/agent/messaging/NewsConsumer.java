package com.thet0rnado.mylittleagentworld.agent.messaging;

import com.thet0rnado.mylittleagentworld.agent.dto.NewsMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import com.thet0rnado.mylittleagentworld.agent.service.AgentService;


@Slf4j
@Component
@RequiredArgsConstructor
public class NewsConsumer {

    private final AgentProducer agentProducer;
    private final AgentService agentService;

    @RabbitListener(queues = "${rabbitmq.queue.news-from-ai}")
    public void startCreatingAgents(NewsMessage message) {
        agentService.saveNewsAndRequestAgents(message);
        agentProducer.sendNewsWithCreatingAgentsRequestToAi(message);
    }

}
