package com.thet0rnado.mylittleagentworld.world.controller;

import com.thet0rnado.mylittleagentworld.world.entity.Conversation;
import com.thet0rnado.mylittleagentworld.world.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping
    public ResponseEntity<List<Conversation>> getAll() {
        return ResponseEntity.ok(conversationService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getById(@PathVariable Long id) {
        return ResponseEntity.ok(conversationService.getById(id));
    }
}