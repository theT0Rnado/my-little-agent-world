package com.thet0rnado.mylittleagentworld.agent.messaging;

import com.thet0rnado.mylittleagentworld.agent.dto.NewsMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NewsConsumer {

    private final AgentProducer agentProducer;

    @RabbitListener(queues = "${rabbitmq.queue.news-from-ai}")
    public void startCreatingAgents(NewsMessage message) {
        agentProducer.sendNewsWithCreatingAgentsRequestToAi(message);
    }

}
