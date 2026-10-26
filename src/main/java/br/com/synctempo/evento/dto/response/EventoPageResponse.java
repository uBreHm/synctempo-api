package br.com.synctempo.evento.dto.response;

import java.util.List;
import org.springframework.data.domain.Page;

public record EventoPageResponse(List<EventoResponse> data, int page, int size,
        long totalItems, int totalPages) {
    public static EventoPageResponse from(Page<EventoResponse> resultado) {
        return new EventoPageResponse(resultado.getContent(), resultado.getNumber(),
                resultado.getSize(), resultado.getTotalElements(), resultado.getTotalPages());
    }
}
