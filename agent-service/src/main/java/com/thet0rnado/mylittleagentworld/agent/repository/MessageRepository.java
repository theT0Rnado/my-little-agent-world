package com.thet0rnado.mylittleagentworld.agent.repository;

import com.thet0rnado.mylittleagentworld.agent.entity.message.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByAgentIsNull(); // найти все новости без агента
}
