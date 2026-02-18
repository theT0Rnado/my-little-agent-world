package com.thet0rnado.mylittleagentworld.ai.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Agent {
    private String name;
    private int moodLevel;
    private String personality;

    public AgentMood getMood() {
        if (moodLevel <= 20) return AgentMood.FURIOUS;
        if (moodLevel <= 40) return AgentMood.ANGRY;
        if (moodLevel <= 60) return AgentMood.NEUTRAL;
        if (moodLevel <= 80) return AgentMood.HAPPY;
        return AgentMood.ECSTATIC;
    }

    public void applyTopicEffect(int delta) {
        this.moodLevel = Math.max(0, Math.min(100, this.moodLevel + delta));
    }

    // ← добавить этот метод!
    public String getMoodEmoji() {
        return switch (getMood()) {
            case ECSTATIC -> "🤩";
            case HAPPY    -> "😊";
            case NEUTRAL  -> "😐";
            case ANGRY    -> "😠";
            case FURIOUS  -> "🤬";
        };
    }
}