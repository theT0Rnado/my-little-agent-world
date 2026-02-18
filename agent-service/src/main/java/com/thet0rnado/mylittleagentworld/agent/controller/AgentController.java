package com.thet0rnado.mylittleagentworld.agent.controller;

import com.thet0rnado.mylittleagentworld.agent.entity.agent.Agent;
import com.thet0rnado.mylittleagentworld.agent.service.AgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
@RequestMapping("/api/agent")
@RequiredArgsConstructor
class AgentController {

    private final AgentService agentService;

    @GetMapping
    @ResponseBody
    public ResponseEntity<List<Agent>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }

}
