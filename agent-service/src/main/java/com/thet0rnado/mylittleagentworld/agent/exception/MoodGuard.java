package com.thet0rnado.mylittleagentworld.agent.exception;

/**
 * Утилита для безопасной работы с уровнем настроения агента.
 *
 * Использование:
 *   // Бросит исключение если value < 0 или > 100
 *   MoodGuard.validate(agent.getName(), newMoodLevel);
 *
 *   // Или зажмёт значение в [0, 100] без исключения
 *   int safe = MoodGuard.clamp(newMoodLevel);
 */
public class MoodGuard {

    public static final int MIN = 0;
    public static final int MAX = 100;

    private MoodGuard() {}

    /**
     * Проверяет что value в диапазоне [0, 100].
     * Бросает MoodOverflowException если выходит за границы.
     */
    public static void validate(String agentName, int value) {
        if (value > MAX) {
            throw new MoodOverflowException(agentName, value, MAX);
        }
        if (value < MIN) {
            throw new MoodOverflowException(agentName, value, MIN);
        }
    }

    /**
     * Зажимает value в [0, 100] без исключения.
     * Используйте когда переполнение допустимо и нужно просто обрезать.
     */
    public static int clamp(int value) {
        return Math.max(MIN, Math.min(MAX, value));
    }

    /**
     * Применяет дельту к текущему значению и зажимает результат.
     * Удобно для applyTopicEffect и аналогичных методов.
     */
    public static int applyDelta(int current, int delta) {
        return clamp(current + delta);
    }
}