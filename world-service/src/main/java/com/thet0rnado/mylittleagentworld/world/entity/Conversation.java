package com.thet0rnado.mylittleagentworld.world.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "conversations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String topic;

    @Column(name = "topic_display_name")
    private String topicDisplayName;

    @Column(name = "alpha_final_mood")
    private int alphaFinalMood;

    @Column(name = "beta_final_mood")
    private int betaFinalMood;

    @Column(name = "gamma_final_mood")
    private int gammaFinalMood;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @ToString.Exclude
    private List<ConversationMessage> messages;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}