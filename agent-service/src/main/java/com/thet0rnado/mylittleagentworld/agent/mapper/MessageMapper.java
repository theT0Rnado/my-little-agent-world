package com.thet0rnado.mylittleagentworld.agent.mapper;

import com.thet0rnado.mylittleagentworld.agent.dto.AgentDto;
import com.thet0rnado.mylittleagentworld.agent.dto.PositionDto;
import com.thet0rnado.mylittleagentworld.agent.entity.Agent;
import com.thet0rnado.mylittleagentworld.agent.entity.Plan;
import com.thet0rnado.mylittleagentworld.agent.entity.Recollection;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class MessageMapper {

    public AgentDto agentEntityToDto(Agent entity) {
        PositionDto position = PositionDto.builder()
                .x(entity.getPosition().getX())
                .y(entity.getPosition().getY())
                .build();

        return AgentDto.builder()
                .name(entity.getName())
                .personality(entity.getPersonality())
                .mood(entity.getMood())
                .recollections(getValidRecollections(entity))
                .plans(getValidPlans(entity))
                .position(position)
                .build();
    }

    private Set<String> getValidRecollections(Agent entity) {
        return entity.getRecollections()
                .stream()
                .map(Recollection::getText)
                .collect(Collectors.toSet());
    }

    private Set<String> getValidPlans(Agent entity) {
        return entity.getPlans()
                .stream()
                .map(Plan::getText)
                .collect(Collectors.toSet());
    }

}
