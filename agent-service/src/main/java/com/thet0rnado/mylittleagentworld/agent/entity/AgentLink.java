package com.thet0rnado.mylittleagentworld.agent.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "agent_links")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AgentLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;

    @Column(name = "linkQuality", nullable = false)
    private Integer linkQuality;

}
