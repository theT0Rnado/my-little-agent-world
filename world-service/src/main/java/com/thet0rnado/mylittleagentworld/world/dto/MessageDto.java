package com.thet0rnado.mylittleagentworld.world.dto;

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
    private String mood;       // "HAPPY", "ANGRY" etc
    private String moodEmoji;  // 😊 😠 etc
    private int moodLevel;     // 0-100
    private String text;       // реплика агента
}