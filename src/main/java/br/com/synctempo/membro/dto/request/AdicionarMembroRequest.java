package br.com.synctempo.membro.dto.request;

import br.com.synctempo.domain.enums.PapelCalendario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdicionarMembroRequest(
        @NotBlank @Email @Size(max = 320) String email,
        @NotNull PapelCalendario papel) {
}
