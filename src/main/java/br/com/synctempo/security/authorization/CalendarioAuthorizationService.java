package br.com.synctempo.security.authorization;

import br.com.synctempo.domain.enums.PapelCalendario;
import br.com.synctempo.domain.repository.MembroCalendarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CalendarioAuthorizationService {
    private final MembroCalendarioRepository membros;

    public CalendarioAuthorizationService(MembroCalendarioRepository membros) {
        this.membros = membros;
    }

    @Transactional(readOnly = true)
    public void exigirLeitura(Long calendarioId) {
        papelDoUsuario(calendarioId);
    }

    @Transactional(readOnly = true)
    public void exigirEdicao(Long calendarioId) {
        PapelCalendario papel = papelDoUsuario(calendarioId);
        if (papel != PapelCalendario.ADMIN && papel != PapelCalendario.EDITOR) {
            throw new AccessDeniedException("Sem permissao para editar o calendario");
        }
    }

    @Transactional(readOnly = true)
    public void exigirAdministracao(Long calendarioId) {
        if (papelDoUsuario(calendarioId) != PapelCalendario.ADMIN) {
            throw new AccessDeniedException("Sem permissao para administrar o calendario");
        }
    }

    private PapelCalendario papelDoUsuario(Long calendarioId) {
        Long usuarioId = usuarioAtualId();
        return membros.findPapel(calendarioId, usuarioId)
                .orElseThrow(() -> new AccessDeniedException("Usuario nao participa do calendario"));
    }

    public Long usuarioAtualId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken token) || !token.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException("Autenticacao obrigatoria");
        }
        try {
            return Long.valueOf(token.getName());
        } catch (NumberFormatException ex) {
            throw new AuthenticationCredentialsNotFoundException("Autenticacao invalida");
        }
    }
}
