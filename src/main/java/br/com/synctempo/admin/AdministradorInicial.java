package br.com.synctempo.admin;

import br.com.synctempo.domain.entity.Usuario;
import br.com.synctempo.domain.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdministradorInicial implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AdministradorInicial.class);

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final String email;
    private final String senha;

    public AdministradorInicial(
            UsuarioRepository usuarios,
            PasswordEncoder encoder,
            @Value("${app.admin.email}") String email,
            @Value("${app.admin.password}") String senha) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.email = email.strip().toLowerCase(Locale.ROOT);
        this.senha = senha;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() || senha.isBlank() || usuarios.existsByEmail(email)) {
            return;
        }
        if (senha.length() < 12 || senha.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("ADMIN_PASSWORD deve ter de 12 a 72 caracteres");
        }
        Usuario admin = usuarios.save(Usuario.cadastrarAdministrador("Administrador", email, encoder.encode(senha)));
        log.info("Administrador inicial {} criado", admin.getId());
    }
}
