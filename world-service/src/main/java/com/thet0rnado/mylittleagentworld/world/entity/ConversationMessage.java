package com.thet0rnado.mylittleagentworld.world.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "conversation_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "agent_name")
    private String agentName;

    private String mood;

    @Column(name = "mood_emoji")
    private String moodEmoji;

    @Column(name = "mood_level")
    private int moodLevel;

    @Column(columnDefinition = "TEXT")
    private String text;

    @ManyToOne
    @JoinColumn(name = "conversation_id")
    @ToString.Exclude
    private Conversation conversation;
}