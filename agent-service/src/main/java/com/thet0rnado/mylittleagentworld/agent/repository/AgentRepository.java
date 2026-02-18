package com.thet0rnado.mylittleagentworld.agent.repository;

import com.thet0rnado.mylittleagentworld.agent.entity.agent.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {
}
