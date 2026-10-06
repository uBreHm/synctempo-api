package br.com.synctempo.calendario.dto.response;

import br.com.synctempo.domain.entity.Calendario;

public record CalendarioResponse(Long id, String nome, String descricao, String cor, Long criadoPorId) {
    public static CalendarioResponse from(Calendario calendario) {
        return new CalendarioResponse(calendario.getId(), calendario.getNome(), calendario.getDescricao(),
                calendario.getCor(), calendario.getCriadoPor().getId());
    }
}
