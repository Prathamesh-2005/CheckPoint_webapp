package com.CheckPoint.CheckPoint.Backend.Config;

import com.CheckPoint.CheckPoint.Backend.Security.JwtUtil;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public WebSocketAuthInterceptor(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        System.out.println("=== WebSocket Message Received ===");
        System.out.println("Command: " + (accessor != null ? accessor.getCommand() : "NULL"));

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            System.out.println("Processing CONNECT command");
            String authToken = accessor.getFirstNativeHeader("Authorization");
            System.out.println("Auth token present: " + (authToken != null));

            if (authToken != null && authToken.startsWith("Bearer ")) {
                String jwt = authToken.substring(7);

                try {
                    String username = jwtUtil.extractUsername(jwt);
                    System.out.println("Extracted username: " + username);

                    if (username != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                        if (jwtUtil.validateToken(jwt, userDetails)) {
                            System.out.println("Token validated successfully for: " + username);
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );
                            accessor.setUser(authentication);
                        } else {
                            System.out.println("Token validation failed");
                        }
                    }
                } catch (Exception e) {
                    System.err.println("WebSocket authentication failed: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("No valid Authorization header found");
            }
        }

        return message;
    }
}