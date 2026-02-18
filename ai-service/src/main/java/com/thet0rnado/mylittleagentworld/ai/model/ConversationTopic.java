package com.thet0rnado.mylittleagentworld.ai.model;

import lombok.Getter;

@Getter
public enum ConversationTopic {
    KINDNESS("Доброта", +20, new String[]{
            "Сегодня кто-то помог мне без всякой причины",
            "Мир стал чуть лучше благодаря маленькому доброму поступку",
            "Когда люди добры — это заразительно!"
    }),
    FRIENDSHIP("Дружба", +15, new String[]{
            "Друзья — это семья которую мы выбираем сами",
            "Хороший друг — это редкость и ценность"
    }),
    BETRAYAL("Предательство", -20, new String[]{
            "Не верю больше никому",
            "После такого трудно снова доверять",
            "Это был удар в спину"
    }),
    CONFLICT("Конфликт", -15, new String[]{
            "Вечные споры ни к чему не приводят",
            "Этот конфликт разрушает всё вокруг"
    }),
    WEATHER("Погода", 0, new String[]{
            "Обычный день, ничего особенного",
            "Погода не радует но и не расстраивает"
    }),
    SUCCESS("Успех", +25, new String[]{
            "Это было невероятно! Мы справились!",
            "Победа после долгой работы — лучшее чувство"
    }),
    FAILURE("Провал", -25, new String[]{
            "Всё пошло не так как планировалось",
            "После такого провала сложно подняться"
    });

    private final String displayName;
    private final int moodDelta;
    private final String[] contextPhrases;

    ConversationTopic(String displayName, int moodDelta, String[] contextPhrases) {
        this.displayName = displayName;
        this.moodDelta = moodDelta;
        this.contextPhrases = contextPhrases;
    }
}