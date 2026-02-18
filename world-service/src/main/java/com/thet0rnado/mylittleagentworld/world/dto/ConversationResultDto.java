package com.thet0rnado.mylittleagentworld.world.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ConversationResultDto {
    private String topic;
    private String topicDisplayName;
    private List<MessageDto> messages;
    private int alphaFinalMood;
    private int betaFinalMood;
    private int gammaFinalMood;
}