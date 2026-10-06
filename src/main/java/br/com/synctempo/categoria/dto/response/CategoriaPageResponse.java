package br.com.synctempo.categoria.dto.response;

import java.util.List;
import org.springframework.data.domain.Page;

public record CategoriaPageResponse(List<CategoriaResponse> data, int page, int size,
        long totalItems, int totalPages) {
    public static CategoriaPageResponse from(Page<CategoriaResponse> resultado) {
        return new CategoriaPageResponse(resultado.getContent(), resultado.getNumber(),
                resultado.getSize(), resultado.getTotalElements(), resultado.getTotalPages());
    }
}
