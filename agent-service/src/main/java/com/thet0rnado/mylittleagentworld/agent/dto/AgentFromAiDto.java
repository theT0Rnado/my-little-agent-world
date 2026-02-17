package com.thet0rnado.mylittleagentworld.agent.dto;

import com.thet0rnado.mylittleagentworld.agent.entity.Mood;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentFromAiDto {

    private String name;
    private String personality;
    private Mood mood;
    private Set<String> recollections;
    private Set<String> plans;
    private PositionDto position;

}
