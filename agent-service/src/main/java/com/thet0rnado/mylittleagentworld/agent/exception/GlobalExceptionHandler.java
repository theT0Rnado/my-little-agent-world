package com.thet0rnado.mylittleagentworld.agent.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Ловит переполнение mood level агента.
     * Возвращает 422 Unprocessable Entity с деталями.
     */
    @ExceptionHandler(MoodOverflowException.class)
    public ResponseEntity<Map<String, Object>> handleMoodOverflow(MoodOverflowException ex) {
        log.warn("⚠️ MoodOverflow: агент='{}', значение={}, предел={}",
                ex.getAgentName(), ex.getAttemptedValue(), ex.getBoundaryValue());

        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(Map.of(
                        "error",          "MOOD_OVERFLOW",
                        "message",        ex.getMessage(),
                        "agentName",      ex.getAgentName(),
                        "attemptedValue", ex.getAttemptedValue(),
                        "boundaryValue",  ex.getBoundaryValue(),
                        "timestamp",      LocalDateTime.now().toString()
                ));
    }

    /**
     * Запасной обработчик для всех остальных непойманных исключений.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("❌ Необработанное исключение: {}", ex.getMessage(), ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error",     "INTERNAL_ERROR",
                        "message",   ex.getMessage(),
                        "timestamp", LocalDateTime.now().toString()
                ));
    }
}