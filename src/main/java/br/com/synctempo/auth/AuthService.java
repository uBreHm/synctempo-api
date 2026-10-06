package br.com.synctempo.auth;

import br.com.synctempo.auth.dto.request.LoginRequest;
import br.com.synctempo.auth.dto.request.RegisterRequest;
import br.com.synctempo.auth.dto.response.LoginResponse;
import br.com.synctempo.domain.entity.Usuario;
import br.com.synctempo.domain.repository.UsuarioRepository;
import br.com.synctempo.security.jwt.JwtTokenService;
import br.com.synctempo.security.ratelimit.LoginRateLimiter;
import br.com.synctempo.security.user.UsuarioPrincipal;
import br.com.synctempo.usuario.dto.response.UsuarioResponse;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service
public class AuthService {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService tokens;
    private final LoginRateLimiter loginRateLimiter;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder encoder,
            AuthenticationManager authenticationManager, JwtTokenService tokens,
            LoginRateLimiter loginRateLimiter) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.authenticationManager = authenticationManager;
        this.tokens = tokens;
        this.loginRateLimiter = loginRateLimiter;
    }

    @Transactional
    public UsuarioResponse registrar(RegisterRequest request) {
        String email = normalizarEmail(request.email());
        if (usuarios.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha deve ter no maximo 72 bytes UTF-8");
        }
        Usuario novo = Usuario.cadastrar(request.name(), email, encoder.encode(request.password()));
        try {
            Usuario salvo = usuarios.saveAndFlush(novo);
            return new UsuarioResponse(salvo.getId(), salvo.getNome(), salvo.getEmail());
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }
    }

    public LoginResponse entrar(LoginRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas");
        }
        String email = normalizarEmail(request.email());
        if (!loginRateLimiter.permitir(email)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Muitas tentativas de login");
        }
        try {
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));
            var principal = (UsuarioPrincipal) authentication.getPrincipal();
            JwtTokenService.TokenEmitido token = tokens.emitir(principal.getId());
            loginRateLimiter.limpar(email);
            return new LoginResponse(token.valor(), "Bearer", token.expiraEm());
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas");
        }
    }

    @Transactional(readOnly = true)
    public UsuarioResponse usuarioAtual(Long usuarioId) {
        Usuario usuario = usuarios.findById(usuarioId)
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token invalido"));
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail());
    }

    private static String normalizarEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }
}
