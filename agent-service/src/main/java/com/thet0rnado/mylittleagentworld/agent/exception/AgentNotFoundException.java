package com.thet0rnado.mylittleagentworld.agent.exception;

public class AgentNotFoundException extends RuntimeException {

    public AgentNotFoundException(Long id) {
        super("Агент не найден: " + id);
    }

}