package br.com.synctempo.calendario.dto.response;

import java.util.List;
import org.springframework.data.domain.Page;

public record CalendarioPageResponse(List<CalendarioResponse> data, int page, int size,
        long totalItems, int totalPages) {
    public static CalendarioPageResponse from(Page<CalendarioResponse> resultado) {
        return new CalendarioPageResponse(resultado.getContent(), resultado.getNumber(),
                resultado.getSize(), resultado.getTotalElements(), resultado.getTotalPages());
    }
}
