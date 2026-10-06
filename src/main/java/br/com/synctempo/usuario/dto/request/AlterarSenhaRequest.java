package br.com.synctempo.usuario.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlterarSenhaRequest(
        @NotBlank @Schema(format = "password") String currentPassword,
        @NotBlank @Size(min = 12, max = 72) @Schema(format = "password") String newPassword) {
}
