package br.com.synctempo.security.authorization;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import br.com.synctempo.domain.enums.PapelCalendario;
import br.com.synctempo.domain.repository.MembroCalendarioRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

class CalendarioAuthorizationServiceTest {
    private final MembroCalendarioRepository membros = mock(MembroCalendarioRepository.class);
    private final CalendarioAuthorizationService autorizacao = new CalendarioAuthorizationService(membros);

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void requiresMembershipAndEnforcesCalendarRoles() {
        authenticate(7L, false);
        when(membros.findPapel(19L, 7L)).thenReturn(Optional.of(PapelCalendario.LEITOR));
        assertDoesNotThrow(() -> autorizacao.exigirLeitura(19L));
        assertThrows(AccessDeniedException.class, () -> autorizacao.exigirEdicao(19L));

        when(membros.findPapel(19L, 7L)).thenReturn(Optional.of(PapelCalendario.EDITOR));
        assertDoesNotThrow(() -> autorizacao.exigirEdicao(19L));
        assertThrows(AccessDeniedException.class, () -> autorizacao.exigirAdministracao(19L));

        when(membros.findPapel(19L, 7L)).thenReturn(Optional.of(PapelCalendario.ADMIN));
        assertDoesNotThrow(() -> autorizacao.exigirAdministracao(19L));
    }

    @Test
    void globalAdminDoesNotBypassCalendarMembership() {
        authenticate(7L, true);
        when(membros.findPapel(19L, 7L)).thenReturn(Optional.empty());
        assertThrows(AccessDeniedException.class, () -> autorizacao.exigirLeitura(19L));
    }

    @Test
    void rejectsMissingAuthentication() {
        assertThrows(AuthenticationCredentialsNotFoundException.class,
                () -> autorizacao.exigirLeitura(19L));
    }

    private void authenticate(Long userId, boolean systemAdmin) {
        Jwt jwt = Jwt.withTokenValue("test-token")
                .header("alg", "HS256")
                .claim("sub", userId.toString())
                .build();
        var authorities = systemAdmin
                ? List.of(new SimpleGrantedAuthority("ROLE_ADMIN_SISTEMA"))
                : List.of(new SimpleGrantedAuthority("ROLE_USUARIO"));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new JwtAuthenticationToken(jwt, authorities, userId.toString()));
        SecurityContextHolder.setContext(context);
    }
}
