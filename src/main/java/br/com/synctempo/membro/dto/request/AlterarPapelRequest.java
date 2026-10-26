package br.com.synctempo.membro.dto.request;

import br.com.synctempo.domain.enums.PapelCalendario;
import jakarta.validation.constraints.NotNull;

public record AlterarPapelRequest(
        @NotNull PapelCalendario papel) {
}
