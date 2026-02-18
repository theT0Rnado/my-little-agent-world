package com.thet0rnado.mylittleagentworld.agent.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private LocalDateTime timestamp; // когда произошла ошибка
    private int status;              // HTTP статус код (404, 400, 500...)
    private String error;            // краткое название ошибки
    private String message;          // подробное сообщение
    private Map<String, String> details; // детали валидации (только для 400)
}