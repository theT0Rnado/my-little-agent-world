package com.thet0rnado.mylittleagentworld.agent.entity.message;

import com.thet0rnado.mylittleagentworld.agent.entity.agent.Agent;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    // Агент пустой при создании — заполнится позже когда AI обработает новость
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")  // nullable — агент может быть не назначен
    private Agent agent;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
