package com.thet0rnado.mylittleagentworld.agent.service;

import com.thet0rnado.mylittleagentworld.agent.dto.AgentFromAiDto;
import com.thet0rnado.mylittleagentworld.agent.dto.AgentListFromAiMessage;
import com.thet0rnado.mylittleagentworld.agent.entity.Agent;
import com.thet0rnado.mylittleagentworld.agent.entity.AgentLink;
import com.thet0rnado.mylittleagentworld.agent.entity.Plan;
import com.thet0rnado.mylittleagentworld.agent.entity.Position;
import com.thet0rnado.mylittleagentworld.agent.entity.Recollection;
import com.thet0rnado.mylittleagentworld.agent.repository.AgentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentRepository agentRepository;

    @Transactional
    public void createAgents(AgentListFromAiMessage message) {
        if (message == null || message.getAgents() == null || message.getAgents().isEmpty()) {
            log.warn("⚠️ Получено пустое сообщение с агентами — пропускаем");
            return;
        }

        log.info("🤖 Начинаем создание {} агентов", message.getAgents().size());

        Set<Agent> savedAgents = new HashSet<>();

        for (AgentFromAiDto dto : message.getAgents()) {
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

    private Agent buildAgent(AgentFromAiDto dto) {
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
}