package com.thet0rnado.mylittleagentworld.agent.messaging;

import com.thet0rnado.mylittleagentworld.agent.dto.NewsMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AgentProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.agent}")
    private String agentExchange;

    @Value("${rabbitmq.routing-key.agent.all.agent.data}")
    private String agentAllAgentDataRoutingKey;

    @Value("${rabbitmq.routing-key.agent.message}")
    private String agentMessageRoutingKey;

    public void sendNewsWithCreatingAgentsRequestToAi(NewsMessage message) {
        try {
            log.info("Sending news to AI service. News ID: {}, Content: {}",
                    message.getNewsId(), message.getContent());

            rabbitTemplate.convertAndSend(
                    agentExchange,
                    agentAllAgentDataRoutingKey,
                    message
            );

            log.info("News successfully sent to queue. News ID: {}", message.getNewsId());
        } catch (Exception e) {
            log.error("Error sending news to queue. News ID: {}, Error: {}",
                    message.getNewsId(), e.getMessage(), e);
            throw new RuntimeException("Failed to send news to RabbitMQ", e);
        }
    }

}
