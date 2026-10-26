package br.com.synctempo.admin.dto.response;

import br.com.synctempo.domain.entity.Usuario;
import br.com.synctempo.domain.enums.PerfilGlobal;

public record UsuarioAdminResponse(Long id, String nome, String email, PerfilGlobal perfil, boolean ativo) {
    public static UsuarioAdminResponse from(Usuario usuario) {
        return new UsuarioAdminResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(),
                usuario.getPerfil(), usuario.isAtivo());
    }
}
