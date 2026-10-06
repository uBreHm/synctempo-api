package br.com.synctempo.usuario;

import br.com.synctempo.domain.entity.Usuario;
import br.com.synctempo.domain.enums.PapelCalendario;
import br.com.synctempo.domain.repository.MembroCalendarioRepository;
import br.com.synctempo.domain.repository.UsuarioRepository;
import br.com.synctempo.security.authorization.CalendarioAuthorizationService;
import br.com.synctempo.usuario.dto.request.AlterarSenhaRequest;
import br.com.synctempo.usuario.dto.request.AtualizarUsuarioRequest;
import br.com.synctempo.usuario.dto.response.UsuarioResponse;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service
public class UsuarioService {
    private final UsuarioRepository usuarios;
    private final MembroCalendarioRepository membros;
    private final CalendarioAuthorizationService autorizacao;
    private final PasswordEncoder encoder;

    public UsuarioService(UsuarioRepository usuarios, MembroCalendarioRepository membros,
            CalendarioAuthorizationService autorizacao, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.membros = membros;
        this.autorizacao = autorizacao;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obter() {
        Usuario usuario = atual();
        return response(usuario);
    }

    @Transactional
    public UsuarioResponse atualizar(AtualizarUsuarioRequest request) {
        Usuario usuario = atual();
        usuario.atualizarPerfil(request.name(), request.email().strip().toLowerCase(Locale.ROOT));
        try {
            usuarios.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }
        return response(usuario);
    }

    @Transactional
    public void alterarSenha(AlterarSenhaRequest request) {
        Usuario usuario = atual();
        if (!encoder.matches(request.currentPassword(), usuario.getSenhaHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas");
        }
        if (request.newPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha deve ter no maximo 72 bytes UTF-8");
        }
        usuario.alterarSenha(encoder.encode(request.newPassword()));
    }

    @Transactional
    public void desativar() {
        Usuario usuario = atual();
        if (membros.existsByUsuario_IdAndPapel(usuario.getId(), PapelCalendario.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transfira a administracao dos calendarios antes de desativar a conta");
        }
        usuario.desativar();
    }

    private Usuario atual() {
        return usuarios.findById(autorizacao.usuarioAtualId())
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private UsuarioResponse response(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail());
    }
}
