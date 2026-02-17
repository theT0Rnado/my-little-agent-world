package com.thet0rnado.mylittleagentworld.agent.controller;

import com.thet0rnado.mylittleagentworld.agent.service.AgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/agent")
@RequiredArgsConstructor
class AgentController {

    private final AgentService agentService;

}
