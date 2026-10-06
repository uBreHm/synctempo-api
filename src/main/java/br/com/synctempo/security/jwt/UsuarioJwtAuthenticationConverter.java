package br.com.synctempo.security.jwt;

import br.com.synctempo.domain.entity.Usuario;
import br.com.synctempo.domain.repository.UsuarioRepository;
import java.util.List;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class UsuarioJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private final UsuarioRepository usuarios;

    public UsuarioJwtAuthenticationConverter(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Long usuarioId;
        try {
            usuarioId = Long.valueOf(jwt.getSubject());
        } catch (NumberFormatException | NullPointerException ex) {
            throw new BadCredentialsException("Token invalido", ex);
        }
        Usuario usuario = usuarios.findById(usuarioId)
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new BadCredentialsException("Token invalido"));
        return new JwtAuthenticationToken(jwt,
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getPerfil().name())),
                usuarioId.toString());
    }
}
