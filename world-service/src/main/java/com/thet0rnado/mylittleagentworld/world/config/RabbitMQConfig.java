package com.thet0rnado.mylittleagentworld.world.config;

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

    @Value("${rabbitmq.queue.news-from-ai}")
    private String newsFromAiQueue;

    @Value("${rabbitmq.routing-key.news-from-ai}")
    private String newsFromAiRoutingKey;

    @Bean
    public TopicExchange newsExchange() {
        return new TopicExchange(newsExchange);
    }

    @Bean
    public Queue newsFromAiQueue() {
        return QueueBuilder
                .durable(newsFromAiQueue)
                .build();
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