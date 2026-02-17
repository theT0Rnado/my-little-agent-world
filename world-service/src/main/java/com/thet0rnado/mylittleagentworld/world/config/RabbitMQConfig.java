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

    @Value("${rabbitmq.queue.news-to-ai}")
    private String newsToAiQueue;

    @Value("${rabbitmq.routing-key.news-to-ai}")
    private String newsToAiRoutingKey;

    @Bean
    public TopicExchange newsExchange() {
        return new TopicExchange(newsExchange);
    }

    @Bean
    public Queue newsToAiQueue() {
        return QueueBuilder
                .durable(newsToAiQueue)
                .withArgument("x-dead-letter-exchange", newsExchange + ".dlx")
                .build();
    }

    @Bean
    public Binding newsToAiBinding(Queue newsToAiQueue, TopicExchange newsExchange) {
        return BindingBuilder
                .bind(newsToAiQueue)
                .to(newsExchange)
                .with(newsToAiRoutingKey);
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