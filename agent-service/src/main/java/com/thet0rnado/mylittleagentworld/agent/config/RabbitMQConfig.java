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

    @Value("${rabbitmq.exchange.requests}")
    private String requestsExchange;

    @Value("${rabbitmq.queue.requests-to-ai}")
    private String requestsToAiQueue;

    @Value("${rabbitmq.routing-key.requests-to-ai}")
    private String requestsToAiRoutingKey;

    @Bean
    public TopicExchange requestsExchange() {
        return new TopicExchange(requestsExchange);
    }

    @Bean
    public Queue requestsToAiQueue() {
        return QueueBuilder
                .durable(requestsToAiQueue)
                .build();
    }

    @Bean
    public Binding newsToAiBinding(Queue requestsToAiQueue, TopicExchange requestsExchange) {
        return BindingBuilder
                .bind(requestsToAiQueue)
                .to(requestsExchange)
                .with(requestsToAiRoutingKey);
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
