package br.com.synctempo.membro.dto.response;

import java.util.List;
import org.springframework.data.domain.Page;

public record ParticipacaoPageResponse(List<ParticipacaoResponse> data, int page, int size,
        long totalItems, int totalPages) {
    public static ParticipacaoPageResponse from(Page<ParticipacaoResponse> resultado) {
        return new ParticipacaoPageResponse(resultado.getContent(), resultado.getNumber(),
                resultado.getSize(), resultado.getTotalElements(), resultado.getTotalPages());
    }
}
