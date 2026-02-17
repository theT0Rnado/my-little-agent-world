package com.thet0rnado.mylittleagentworld.world.mapper;

import com.thet0rnado.mylittleagentworld.world.dto.NewsDto;
import com.thet0rnado.mylittleagentworld.world.dto.NewsMessage;
import com.thet0rnado.mylittleagentworld.world.entity.News;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class NewsMapper {

    public News toEntity(NewsDto dto) {
        return News.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .source(dto.getSource())
                .publishedAt(dto.getPublishedAt())
                .status(News.NewsStatus.PENDING)
                .build();
    }

    public NewsDto toDto(News entity) {
        return NewsDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .source(entity.getSource())
                .publishedAt(entity.getPublishedAt())
                .status(entity.getStatus().name())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public NewsMessage toMessageDto(News entity) {
        return NewsMessage.builder()
                .newsId(entity.getId())
                .title(entity.getTitle())
                .content(entity.getContent())
                .source(entity.getSource())
                .publishedAt(entity.getPublishedAt())
                .sentAt(LocalDateTime.now())
                .build();
    }
}