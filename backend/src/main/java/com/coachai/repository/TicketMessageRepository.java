package com.coachai.repository;

import com.coachai.model.SupportTicket;
import com.coachai.model.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, String> {
    List<TicketMessage> findByTicketOrderByTimestampAsc(SupportTicket ticket);
    List<TicketMessage> findByTicketIdOrderByTimestampAsc(String ticketId);
}

