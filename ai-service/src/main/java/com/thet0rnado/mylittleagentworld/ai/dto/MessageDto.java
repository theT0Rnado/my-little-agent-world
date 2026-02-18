package com.thet0rnado.mylittleagentworld.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private String agentName;
    private String mood;
    private String moodEmoji;
    private int moodLevel;
    private String text;
}