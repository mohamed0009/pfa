package com.coachai.controller.user;

import com.coachai.model.SupportTicket;
import com.coachai.model.TicketMessage;
import com.coachai.model.User;
import com.coachai.repository.SupportTicketRepository;
import com.coachai.repository.TicketMessageRepository;
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
    
    @Autowired
    private TicketMessageRepository ticketMessageRepository;
    
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
            
            // Map tickets with messages for frontend
            List<Map<String, Object>> ticketsWithMessages = tickets.stream().map(ticket -> {
                Map<String, Object> ticketMap = new java.util.HashMap<>();
                ticketMap.put("id", ticket.getId());
                ticketMap.put("ticketNumber", ticket.getTicketNumber());
                ticketMap.put("subject", ticket.getSubject());
                ticketMap.put("description", ticket.getDescription());
                ticketMap.put("category", ticket.getCategory().toString());
                ticketMap.put("priority", ticket.getPriority().toString());
                ticketMap.put("status", ticket.getStatus().toString());
                ticketMap.put("createdAt", ticket.getCreatedAt());
                ticketMap.put("updatedAt", ticket.getUpdatedAt());
                ticketMap.put("user", Map.of("id", ticket.getUser().getId()));
                
                // Load and map messages
                List<TicketMessage> messages = ticketMessageRepository.findByTicketOrderByTimestampAsc(ticket);
                List<Map<String, Object>> messagesList = messages.stream().map(msg -> {
                    Map<String, Object> msgMap = new java.util.HashMap<>();
                    msgMap.put("id", msg.getId());
                    msgMap.put("ticketId", msg.getTicket().getId());
                    msgMap.put("sender", msg.getSender().getId().equals(user.getId()) ? "user" : "support");
                    msgMap.put("senderName", msg.getSender().getFirstName() + " " + msg.getSender().getLastName());
                    msgMap.put("content", msg.getMessage());
                    msgMap.put("timestamp", msg.getTimestamp());
                    msgMap.put("attachments", List.of());
                    return msgMap;
                }).collect(java.util.stream.Collectors.toList());
                ticketMap.put("messages", messagesList);
                
                return ticketMap;
            }).collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(ticketsWithMessages);
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
            
            // Map ticket with messages
            Map<String, Object> ticketMap = new java.util.HashMap<>();
            ticketMap.put("id", ticket.getId());
            ticketMap.put("ticketNumber", ticket.getTicketNumber());
            ticketMap.put("subject", ticket.getSubject());
            ticketMap.put("description", ticket.getDescription());
            ticketMap.put("category", ticket.getCategory().toString());
            ticketMap.put("priority", ticket.getPriority().toString());
            ticketMap.put("status", ticket.getStatus().toString());
            ticketMap.put("createdAt", ticket.getCreatedAt());
            ticketMap.put("updatedAt", ticket.getUpdatedAt());
            ticketMap.put("user", Map.of("id", ticket.getUser().getId()));
            
            // Load and map messages
            List<TicketMessage> messages = ticketMessageRepository.findByTicketOrderByTimestampAsc(ticket);
            List<Map<String, Object>> messagesList = messages.stream().map(msg -> {
                Map<String, Object> msgMap = new java.util.HashMap<>();
                msgMap.put("id", msg.getId());
                msgMap.put("ticketId", msg.getTicket().getId());
                msgMap.put("sender", msg.getSender().getId().equals(ticket.getUser().getId()) ? "user" : "support");
                msgMap.put("senderName", msg.getSender().getFirstName() + " " + msg.getSender().getLastName());
                msgMap.put("content", msg.getMessage());
                msgMap.put("timestamp", msg.getTimestamp());
                msgMap.put("attachments", List.of());
                return msgMap;
            }).collect(java.util.stream.Collectors.toList());
            ticketMap.put("messages", messagesList);
            
            return ResponseEntity.ok(ticketMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching ticket", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PostMapping("/tickets/{id}/messages")
    public ResponseEntity<?> addMessage(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> messageData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ticket ID is required"));
            }
            
            if (messageData == null || !messageData.containsKey("message")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message content is required"));
            }
            
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            SupportTicket ticket = supportTicketRepository.findById(id).orElse(null);
            if (ticket == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Ticket not found"));
            }
            
            TicketMessage message = new TicketMessage();
            message.setTicket(ticket);
            message.setSender(user);
            message.setMessage((String) messageData.get("message"));
            message.setInternal(false);
            
            ticket.setUpdatedAt(java.time.LocalDateTime.now());
            if (ticket.getStatus() == SupportTicket.TicketStatus.OPEN) {
                ticket.setStatus(SupportTicket.TicketStatus.IN_PROGRESS);
            }
            
            TicketMessage savedMessage = ticketMessageRepository.save(message);
            
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("id", savedMessage.getId());
            response.put("ticketId", ticket.getId());
            response.put("sender", "user");
            response.put("senderName", user.getFirstName() + " " + user.getLastName());
            response.put("content", savedMessage.getMessage());
            response.put("timestamp", savedMessage.getTimestamp());
            response.put("attachments", List.of());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error adding message", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}


