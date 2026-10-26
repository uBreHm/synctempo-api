package br.com.synctempo.membro.dto.response;

import java.util.List;
import org.springframework.data.domain.Page;

public record MembroPageResponse(List<MembroResponse> data, int page, int size,
        long totalItems, int totalPages) {
    public static MembroPageResponse from(Page<MembroResponse> resultado) {
        return new MembroPageResponse(resultado.getContent(), resultado.getNumber(),
                resultado.getSize(), resultado.getTotalElements(), resultado.getTotalPages());
    }
}
