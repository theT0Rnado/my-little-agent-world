package com.thet0rnado.mylittleagentworld.agent.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class RabbitMQConfig {

    @Value("${rabbitmq.exchange.agent}")
    private String agentExchange;

    @Value("${rabbitmq.exchange.news}")
    private String newsExchange;

    @Value("${rabbitmq.queue.agent-all-agent-data}")
    private String agentAllAgentDataQueue;

    @Value("${rabbitmq.queue.agent-message}")
    private String agentMessageQueue;

    @Value("${rabbitmq.queue.agent-all-agent-data-from-ai}")
    private String agentAllAgentDataFromAiQueue;

    @Value("${rabbitmq.queue.agent-message-from.-ai}")
    private String agentMessageFromAiQueue;

    @Value("${rabbitmq.queue.news-from-ai}")
    private String newsFromAiQueue;

    @Value("${rabbitmq.routing-key.agent-all-agent-data}")
    private String agentAllAgentDataRoutingKey;

    @Value("${rabbitmq.routing-key.agent-message}")
    private String agentMessageRoutingKey;

    @Value("${rabbitmq.routing-key.agent-all-agent-data-from-ai}")
    private String agentAllAgentDataFromAiRoutingKey;

    @Value("${rabbitmq.routing-key.agent-message-from-ai}")
    private String agentMessageFromAiRoutingKey;

    @Value("${rabbitmq.routing-key.news-from-ai}")
    private String newsFromAiRoutingKey;

    @Bean
    public TopicExchange agentExchange() {
        return new TopicExchange(agentExchange);
    }

    @Bean
    public TopicExchange newsExchange() {
        return new TopicExchange(newsExchange);
    }

    @Bean
    public Queue agentAllAgentDataQueue() {
        return QueueBuilder
                .durable(agentAllAgentDataQueue)
                .build();
    }

    @Bean
    public Queue agentMessageQueue() {
        return QueueBuilder
                .durable(agentMessageQueue)
                .build();
    }

    @Bean
    public Queue agentAllAgentDataFromAiQueue() {
        return QueueBuilder
                .durable(agentAllAgentDataFromAiQueue)
                .build();
    }

    @Bean
    public Queue agentMessageFromAiQueue() {
        return QueueBuilder
                .durable(agentMessageFromAiQueue)
                .build();
    }

    @Bean
    public Queue newsFromAiQueue() {
        return QueueBuilder
                .durable(newsFromAiQueue)
                .build();
    }

    @Bean
    public Binding agentAllAgentDataBinding(Queue agentAllAgentDataQueue, TopicExchange agentExchange) {
        return BindingBuilder
                .bind(agentAllAgentDataQueue)
                .to(agentExchange)
                .with(agentAllAgentDataRoutingKey);
    }

    @Bean
    public Binding agentMessageBinding(Queue agentMessageQueue, TopicExchange agentExchange) {
        return BindingBuilder
                .bind(agentMessageQueue)
                .to(agentExchange)
                .with(agentMessageRoutingKey);
    }

    @Bean
    public Binding agentAllAgentDataFromAiBinding(Queue agentAllAgentDataFromAiQueue, TopicExchange agentExchange) {
        return BindingBuilder
                .bind(agentAllAgentDataFromAiQueue)
                .to(agentExchange)
                .with(agentAllAgentDataFromAiRoutingKey);
    }

    @Bean
    public Binding agentMessageFromAiBinding(Queue agentMessageFromAiQueue, TopicExchange agentExchange) {
        return BindingBuilder
                .bind(agentMessageFromAiQueue)
                .to(agentExchange)
                .with(agentMessageFromAiRoutingKey);
    }

    @Bean
    public Binding newsFromAiBinding(Queue newsFromAiQueue, TopicExchange newsExchange) {
        return BindingBuilder
                .bind(newsFromAiQueue)
                .to(newsExchange)
                .with(newsFromAiRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }

}
