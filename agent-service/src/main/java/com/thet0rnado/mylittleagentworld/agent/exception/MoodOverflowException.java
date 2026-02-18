package com.thet0rnado.mylittleagentworld.agent.exception;

/**
 * Выбрасывается когда уровень настроения агента
 * выходит за допустимые границы [0, 100].
 */
public class MoodOverflowException extends RuntimeException {

    private final String agentName;
    private final int attemptedValue;
    private final int boundaryValue;

    public MoodOverflowException(String agentName, int attemptedValue, int boundaryValue) {
        super(String.format(
                "Mood overflow для агента '%s': попытка установить %d, допустимый предел %d",
                agentName, attemptedValue, boundaryValue
        ));
        this.agentName = agentName;
        this.attemptedValue = attemptedValue;
        this.boundaryValue = boundaryValue;
    }

    public String getAgentName() { return agentName; }
    public int getAttemptedValue() { return attemptedValue; }
    public int getBoundaryValue() { return boundaryValue; }
}