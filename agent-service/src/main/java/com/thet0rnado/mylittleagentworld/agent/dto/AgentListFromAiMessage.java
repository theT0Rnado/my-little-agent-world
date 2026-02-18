package com.thet0rnado.mylittleagentworld.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentListFromAiMessage {

    private Set<AgentDto> agents;

}
