package br.com.synctempo.evento.dto.response;

import br.com.synctempo.categoria.dto.response.CategoriaResponse;
import br.com.synctempo.domain.entity.Evento;
import br.com.synctempo.domain.enums.Visibilidade;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record EventoResponse(Long id, Long calendarioId, Long criadoPorId, String titulo, String descricao,
        String localizacao, String linkReuniao, LocalDate dataEvento, LocalTime horaInicio, LocalTime horaFim,
        boolean diaInteiro, Visibilidade visibilidade, List<CategoriaResponse> categorias) {
    public static EventoResponse from(Evento evento) {
        return new EventoResponse(evento.getId(), evento.getCalendario().getId(), evento.getCriadoPor().getId(),
                evento.getTitulo(), evento.getDescricao(), evento.getLocalizacao(), evento.getLinkReuniao(),
                evento.getDataEvento(), evento.getHoraInicio(), evento.getHoraFim(), evento.isDiaInteiro(),
                evento.getVisibilidade(), evento.getCategorias().stream().map(CategoriaResponse::from).toList());
    }

    public static EventoResponse ocupado(Evento evento) {
        return new EventoResponse(evento.getId(), evento.getCalendario().getId(), evento.getCriadoPor().getId(),
                "Ocupado", null, null, null, evento.getDataEvento(), evento.getHoraInicio(), evento.getHoraFim(),
                evento.isDiaInteiro(), evento.getVisibilidade(), List.of());
    }
}
