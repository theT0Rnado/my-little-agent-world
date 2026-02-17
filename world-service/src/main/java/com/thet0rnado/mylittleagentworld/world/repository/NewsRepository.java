package com.thet0rnado.mylittleagentworld.world.repository;

import com.thet0rnado.mylittleagentworld.world.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {

    List<News> findByStatus(News.NewsStatus status);

}