package com.thet0rnado.mylittleagentworld.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResultDto {
    private String topic;
    private String topicDisplayName;
    private List<MessageDto> messages;
    private int alphaFinalMood;
    private int betaFinalMood;
    private int gammaFinalMood;  // ← добавить!
}