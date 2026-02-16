package com.thet0rnado.mylittleagentworld.agent.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "agents")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "personality", nullable = false)
    private String personality;

    @Enumerated(EnumType.STRING)
    @Column(name = "mood", nullable = false, length = 16)
    private Mood mood;

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Recollection> recollections = new HashSet<>();

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Plan> plans = new HashSet<>();

    @OneToOne
    @JoinColumn(name = "position_id", nullable = false)
    private Position position;

}
