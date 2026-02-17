package com.thet0rnado.mylittleagentworld.world.mapper;

import com.thet0rnado.mylittleagentworld.world.dto.NewsDto;
import com.thet0rnado.mylittleagentworld.world.dto.NewsMessage;
import com.thet0rnado.mylittleagentworld.world.entity.News;
import org.springframework.stereotype.Component;

@Component
public class NewsMapper {

    public News toEntity(NewsMessage message) {
        return News.builder()
                .content(message.getContent())
                .status(News.NewsStatus.PROCESSED)
                .build();
    }

    public NewsDto toDto(News entity) {
        return NewsDto.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .status(entity.getStatus().name())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}