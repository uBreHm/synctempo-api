package br.com.synctempo.security.user;

import br.com.synctempo.domain.repository.UsuarioRepository;
import java.util.Locale;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UsuarioDetailsService implements UserDetailsService {
    private final UsuarioRepository usuarios;

    public UsuarioDetailsService(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String emailNormalizado = email.strip().toLowerCase(Locale.ROOT);
        return usuarios.findByEmail(emailNormalizado)
                .map(UsuarioPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("Credenciais invalidas"));
    }
}
