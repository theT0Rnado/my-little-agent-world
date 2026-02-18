package com.thet0rnado.mylittleagentworld.ai.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange.news}")
    private String newsExchange;

    @Value("${rabbitmq.queue.conversation}")
    private String conversationQueue;

    @Value("${rabbitmq.routing-key.conversation}")
    private String conversationRoutingKey;

    @Bean
    public TopicExchange newsExchange() {
        return new TopicExchange(newsExchange);
    }

    @Bean
    public Queue conversationQueue() {
        return QueueBuilder.durable(conversationQueue).build();
    }

    @Bean
    public Binding conversationBinding(Queue conversationQueue, TopicExchange newsExchange) {
        return BindingBuilder.bind(conversationQueue).to(newsExchange).with(conversationRoutingKey);
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