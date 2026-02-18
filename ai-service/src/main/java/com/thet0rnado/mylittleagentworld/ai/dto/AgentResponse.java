package com.thet0rnado.mylittleagentworld.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentResponse {
    private String agentName;
    private String response;
    private long processingTimeMs;
}