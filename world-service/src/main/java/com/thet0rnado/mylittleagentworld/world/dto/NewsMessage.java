package com.thet0rnado.mylittleagentworld.world.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsMessage{
    private Long newsId;
    private String title;
    private String content;
    private String source;
    private LocalDateTime publishedAt;
    private LocalDateTime sentAt;
}