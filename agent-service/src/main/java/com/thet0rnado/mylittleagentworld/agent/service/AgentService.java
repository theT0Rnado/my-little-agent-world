package com.thet0rnado.mylittleagentworld.agent.service;

import com.thet0rnado.mylittleagentworld.agent.dto.AgentDto;
import com.thet0rnado.mylittleagentworld.agent.dto.AgentListFromAiMessage;
import com.thet0rnado.mylittleagentworld.agent.dto.NewsMessage;
import com.thet0rnado.mylittleagentworld.agent.entity.agent.Agent;
import com.thet0rnado.mylittleagentworld.agent.entity.agent.Plan;
import com.thet0rnado.mylittleagentworld.agent.entity.agent.Position;
import com.thet0rnado.mylittleagentworld.agent.entity.agent.Recollection;
import com.thet0rnado.mylittleagentworld.agent.repository.AgentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thet0rnado.mylittleagentworld.agent.entity.message.Message;
import com.thet0rnado.mylittleagentworld.agent.entity.agent.Mood;
import com.thet0rnado.mylittleagentworld.agent.repository.MessageRepository;
import java.time.LocalDateTime;


import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentRepository agentRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public void createAgents(AgentListFromAiMessage message) {
        if (message == null || message.getAgents() == null || message.getAgents().isEmpty()) {
            log.warn("⚠️ Получено пустое сообщение с агентами — пропускаем");
            return;
        }

        log.info("🤖 Начинаем создание {} агентов", message.getAgents().size());

        Set<Agent> savedAgents = new HashSet<>();

        for (AgentDto dto : message.getAgents()) {
            try {
                Agent agent = buildAgent(dto);
                Agent saved = agentRepository.save(agent);
                savedAgents.add(saved);
                log.info("✅ Агент '{}' сохранён с ID: {}", saved.getName(), saved.getId());
            } catch (Exception e) {
                log.error("❌ Ошибка при создании агента '{}': {}", dto.getName(), e.getMessage(), e);
            }
        }

        log.info("✅ Создано агентов: {}/{}", savedAgents.size(), message.getAgents().size());
    }

    private Agent buildAgent(AgentDto dto) {
        // Сначала создаём агента без связей чтобы получить managed entity
        Agent agent = Agent.builder()
                .name(dto.getName())
                .personality(dto.getPersonality())
                .mood(dto.getMood())
                .recollections(new HashSet<>())
                .plans(new HashSet<>())
                .linkedAgents(new HashSet<>())
                .build();

        // Позиция
        Position position;
        if (dto.getPosition() != null) {
            position = Position.builder()
                    .x(dto.getPosition().getX())
                    .y(dto.getPosition().getY())
                    .agent(agent)
                    .build();
        } else {
            // Дефолтная позиция если AI не передал
            position = Position.builder()
                    .x(0.0)
                    .y(0.0)
                    .agent(agent)
                    .build();
        }
        agent.setPosition(position);

        // Воспоминания
        if (dto.getRecollections() != null) {
            Set<Recollection> recollections = dto.getRecollections().stream()
                    .map(text -> Recollection.builder()
                            .text(text)
                            .agent(agent)
                            .build())
                    .collect(Collectors.toSet());
            agent.setRecollections(recollections);
        }

        // Планы
        if (dto.getPlans() != null) {
            Set<Plan> plans = dto.getPlans().stream()
                    .map(text -> Plan.builder()
                            .text(text)
                            .agent(agent)
                            .build())
                    .collect(Collectors.toSet());
            agent.setPlans(plans);
        }

        return agent;
    }

    public List<Agent> getAllAgents() {
        return agentRepository.findAll();
    }

    @Transactional
    public void saveNewsAndRequestAgents(NewsMessage message) {
        // Создаём пустого агента без данных — заполнится позже от AI
        Agent agent = Agent.builder()
                .name("")
                .personality("")
                .mood(Mood.NEUTRAL)
                .recollections(new HashSet<>())
                .plans(new HashSet<>())
                .linkedAgents(new HashSet<>())
                .build();

        Position position = Position.builder()
                .x(0.0)
                .y(0.0)
                .agent(agent)
                .build();
        agent.setPosition(position);

        Agent savedAgent = agentRepository.save(agent);

        // Сохраняем новость привязанную к пустому агенту
        Message savedMessage = Message.builder()
                .content(message.getContent())
                .agent(savedAgent)
                .createdAt(LocalDateTime.now())
                .build();

        messageRepository.save(savedMessage);

        log.info("✅ Новость сохранена с ID: {}, агент ID: {}",
                savedMessage.getId(), savedAgent.getId());
    }
}