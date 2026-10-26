package br.com.synctempo.admin.dto.response;

import java.util.List;
import org.springframework.data.domain.Page;

public record UsuarioAdminPageResponse(List<UsuarioAdminResponse> data, int page, int size,
        long totalItems, int totalPages) {
    public static UsuarioAdminPageResponse from(Page<UsuarioAdminResponse> resultado) {
        return new UsuarioAdminPageResponse(resultado.getContent(), resultado.getNumber(),
                resultado.getSize(), resultado.getTotalElements(), resultado.getTotalPages());
    }
}
