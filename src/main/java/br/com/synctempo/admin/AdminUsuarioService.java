package br.com.synctempo.admin;

import br.com.synctempo.admin.dto.response.UsuarioAdminPageResponse;
import br.com.synctempo.admin.dto.response.UsuarioAdminResponse;
import br.com.synctempo.domain.entity.Usuario;
import br.com.synctempo.domain.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service
public class AdminUsuarioService {
    private static final Logger log = LoggerFactory.getLogger(AdminUsuarioService.class);

    private final UsuarioRepository usuarios;

    public AdminUsuarioService(UsuarioRepository usuarios) {
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public UsuarioAdminPageResponse listar(int pagina, int tamanho) {
        if (pagina < 0 || tamanho < 1 || tamanho > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paginacao invalida");
        }
        return UsuarioAdminPageResponse.from(usuarios.findAll(PageRequest.of(pagina, tamanho, Sort.by("id")))
                .map(UsuarioAdminResponse::from));
    }

    @Transactional
    public void ativar(Long id) {
        Usuario usuario = usuarios.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario inexistente"));
        usuario.ativar();
        log.info("Usuario {} reativado", id);
    }
}
