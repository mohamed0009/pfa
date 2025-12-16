package com.coachai.controller.user;

import com.coachai.model.SupportTicket;
import com.coachai.model.User;
import com.coachai.repository.SupportTicketRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/support")
@CrossOrigin(origins = "http://localhost:4200")
public class UserSupportController {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SupportTicketRepository supportTicketRepository;
    
    @GetMapping("/tickets")
    public ResponseEntity<?> getTickets(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            List<SupportTicket> tickets = supportTicketRepository.findByUserOrderByCreatedAtDesc(user);
            if (tickets == null) {
                tickets = List.of();
            }
            
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching tickets", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(
            @RequestBody(required = false) Map<String, Object> ticketData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (ticketData == null || ticketData.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body is required"));
            }
            
            if (!ticketData.containsKey("subject") || !ticketData.containsKey("description")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subject and description are required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            SupportTicket ticket = new SupportTicket();
            ticket.setUser(user);
            ticket.setStatus(SupportTicket.TicketStatus.OPEN);
            ticket.setSubject((String) ticketData.get("subject"));
            ticket.setDescription((String) ticketData.get("description"));
            
            if (ticketData.containsKey("category")) {
                try {
                    ticket.setCategory(SupportTicket.TicketCategory.valueOf(((String) ticketData.get("category")).toUpperCase()));
                } catch (Exception e) {
                    ticket.setCategory(SupportTicket.TicketCategory.AUTRE);
                }
            } else {
                ticket.setCategory(SupportTicket.TicketCategory.AUTRE);
            }
            
            if (ticketData.containsKey("priority")) {
                try {
                    ticket.setPriority(SupportTicket.TicketPriority.valueOf(((String) ticketData.get("priority")).toUpperCase()));
                } catch (Exception e) {
                    ticket.setPriority(SupportTicket.TicketPriority.MEDIUM);
                }
            } else {
                ticket.setPriority(SupportTicket.TicketPriority.MEDIUM);
            }
            
            // Generate ticket number
            ticket.setTicketNumber("TICKET-" + System.currentTimeMillis());
            
            SupportTicket saved = supportTicketRepository.save(ticket);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating ticket", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/tickets/{id}")
    public ResponseEntity<?> getTicket(@PathVariable String id, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ticket ID is required"));
            }
            
            SupportTicket ticket = supportTicketRepository.findById(id).orElse(null);
            if (ticket == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Ticket not found", "id", id));
            }
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching ticket", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


