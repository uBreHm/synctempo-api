package br.com.synctempo.security.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

public final class SecurityErrorResponses {
    private SecurityErrorResponses() {
    }

    public static void unauthorized(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException {
        response.setHeader("WWW-Authenticate", "Bearer");
        write(response, HttpServletResponse.SC_UNAUTHORIZED,
                "{\"code\":\"UNAUTHORIZED\",\"message\":\"Autenticacao obrigatoria\"}");
    }

    public static void forbidden(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException exception) throws IOException {
        write(response, HttpServletResponse.SC_FORBIDDEN,
                "{\"code\":\"FORBIDDEN\",\"message\":\"Acesso negado\"}");
    }

    private static void write(HttpServletResponse response, int status, String body) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Cache-Control", "no-store");
        response.getWriter().write(body);
    }
}
