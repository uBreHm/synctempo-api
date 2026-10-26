package br.com.synctempo.evento.dto.request;

import br.com.synctempo.domain.enums.Visibilidade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

public record EventoRequest(
        @NotBlank @Size(max = 160) String titulo,
        @Size(max = 4000) String descricao,
        @Size(max = 255) String localizacao,
        @Size(max = 2048) @Pattern(regexp = "https?://\\S+") String linkReuniao,
        @NotNull LocalDate dataEvento,
        LocalTime horaInicio,
        LocalTime horaFim,
        boolean diaInteiro,
        @NotNull Visibilidade visibilidade,
        Set<Long> categoriaIds) {
}
