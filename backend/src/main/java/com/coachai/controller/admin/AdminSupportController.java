package com.coachai.controller.admin;

import com.coachai.model.SupportTicket;
import com.coachai.model.User;
import com.coachai.repository.SupportTicketRepository;
import com.coachai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/support")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminSupportController {
    @Autowired
    private SupportTicketRepository supportTicketRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/tickets")
    public ResponseEntity<?> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            List<SupportTicket> tickets = supportTicketRepository.findAll();
            
            // Filter by status
            if (status != null && !status.isEmpty()) {
                try {
                    SupportTicket.TicketStatus statusEnum = SupportTicket.TicketStatus.valueOf(status.toUpperCase());
                    tickets = tickets.stream()
                        .filter(t -> t.getStatus() == statusEnum)
                        .collect(Collectors.toList());
                } catch (IllegalArgumentException e) {
                    // Invalid status, ignore filter
                }
            }
            
            // Filter by priority
            if (priority != null && !priority.isEmpty()) {
                try {
                    SupportTicket.TicketPriority priorityEnum = SupportTicket.TicketPriority.valueOf(priority.toUpperCase());
                    tickets = tickets.stream()
                        .filter(t -> t.getPriority() == priorityEnum)
                        .collect(Collectors.toList());
                } catch (IllegalArgumentException e) {
                    // Invalid priority, ignore filter
                }
            }
            
            // Filter by category
            if (category != null && !category.isEmpty()) {
                try {
                    SupportTicket.TicketCategory categoryEnum = SupportTicket.TicketCategory.valueOf(category.toUpperCase());
                    tickets = tickets.stream()
                        .filter(t -> t.getCategory() == categoryEnum)
                        .collect(Collectors.toList());
                } catch (IllegalArgumentException e) {
                    // Invalid category, ignore filter
                }
            }
            
            // Map to admin format
            List<Map<String, Object>> ticketsData = new ArrayList<>();
            for (SupportTicket ticket : tickets) {
                User user = ticket.getUser();
                User assignedTo = ticket.getAssignedTo();
                
                Map<String, Object> ticketData = new HashMap<>();
                ticketData.put("id", ticket.getId());
                ticketData.put("ticketNumber", ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "");
                ticketData.put("title", ticket.getSubject() != null ? ticket.getSubject() : "");
                ticketData.put("description", ticket.getDescription() != null ? ticket.getDescription() : "");
                ticketData.put("category", ticket.getCategory() != null ? ticket.getCategory().toString().toLowerCase() : "autre");
                ticketData.put("priority", ticket.getPriority() != null ? ticket.getPriority().toString().toLowerCase() : "medium");
                ticketData.put("status", ticket.getStatus() != null ? ticket.getStatus().toString().toLowerCase().replace("_", "_") : "open");
                ticketData.put("userId", user != null ? user.getId() : "");
                ticketData.put("userName", user != null ? ((user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : "")).trim() : "");
                ticketData.put("userEmail", user != null && user.getEmail() != null ? user.getEmail() : "");
                ticketData.put("assignedTo", assignedTo != null ? assignedTo.getId() : "");
                ticketData.put("assignedToName", assignedTo != null ? ((assignedTo.getFirstName() != null ? assignedTo.getFirstName() : "") + " " + (assignedTo.getLastName() != null ? assignedTo.getLastName() : "")).trim() : "");
                ticketData.put("messages", List.of()); // Messages would be loaded separately if needed
                ticketData.put("createdAt", ticket.getCreatedAt() != null ? ticket.getCreatedAt() : new Date());
                ticketData.put("updatedAt", ticket.getUpdatedAt() != null ? ticket.getUpdatedAt() : new Date());
                ticketsData.add(ticketData);
            }
            
            return ResponseEntity.ok(ticketsData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching tickets", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @GetMapping("/tickets/{id}")
    public ResponseEntity<?> getTicketById(
            @PathVariable String id,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            SupportTicket ticket = supportTicketRepository.findById(id).orElse(null);
            if (ticket == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Ticket not found"));
            }
            
            User user = ticket.getUser();
            User assignedTo = ticket.getAssignedTo();
            
            Map<String, Object> ticketData = new HashMap<>();
            ticketData.put("id", ticket.getId());
            ticketData.put("ticketNumber", ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "");
            ticketData.put("title", ticket.getSubject() != null ? ticket.getSubject() : "");
            ticketData.put("description", ticket.getDescription() != null ? ticket.getDescription() : "");
            ticketData.put("category", ticket.getCategory() != null ? ticket.getCategory().toString().toLowerCase() : "autre");
            ticketData.put("priority", ticket.getPriority() != null ? ticket.getPriority().toString().toLowerCase() : "medium");
            ticketData.put("status", ticket.getStatus() != null ? ticket.getStatus().toString().toLowerCase().replace("_", "_") : "open");
            ticketData.put("userId", user != null ? user.getId() : "");
            ticketData.put("userName", user != null ? ((user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : "")).trim() : "");
            ticketData.put("userEmail", user != null && user.getEmail() != null ? user.getEmail() : "");
            ticketData.put("assignedTo", assignedTo != null ? assignedTo.getId() : "");
            ticketData.put("assignedToName", assignedTo != null ? ((assignedTo.getFirstName() != null ? assignedTo.getFirstName() : "") + " " + (assignedTo.getLastName() != null ? assignedTo.getLastName() : "")).trim() : "");
            ticketData.put("messages", List.of()); // Messages would be loaded separately if needed
            ticketData.put("createdAt", ticket.getCreatedAt() != null ? ticket.getCreatedAt() : new Date());
            ticketData.put("updatedAt", ticket.getUpdatedAt() != null ? ticket.getUpdatedAt() : new Date());
            
            return ResponseEntity.ok(ticketData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching ticket", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/tickets/{id}/assign")
    public ResponseEntity<?> assignTicket(
            @PathVariable String id,
            @RequestBody Map<String, String> assignData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            SupportTicket ticket = supportTicketRepository.findById(id).orElse(null);
            if (ticket == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Ticket not found"));
            }
            
            if (assignData.containsKey("assignedTo")) {
                User assignedTo = userRepository.findById(assignData.get("assignedTo")).orElse(null);
                if (assignedTo != null) {
                    ticket.setAssignedTo(assignedTo);
                    supportTicketRepository.save(ticket);
                }
            }
            
            return ResponseEntity.ok(Map.of("message", "Ticket assigned successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error assigning ticket", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
    
    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusData,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
            
            SupportTicket ticket = supportTicketRepository.findById(id).orElse(null);
            if (ticket == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Ticket not found"));
            }
            
            if (statusData.containsKey("status")) {
                try {
                    SupportTicket.TicketStatus status = SupportTicket.TicketStatus.valueOf(statusData.get("status").toUpperCase());
                    ticket.setStatus(status);
                    supportTicketRepository.save(ticket);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
                }
            }
            
            return ResponseEntity.ok(Map.of("message", "Ticket status updated successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error updating ticket status", "message", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}

