package com.thet0rnado.mylittleagentworld.agent.repository;

import com.thet0rnado.mylittleagentworld.agent.entity.AgentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgentRepository extends JpaRepository<AgentEntity, Long> {
}
