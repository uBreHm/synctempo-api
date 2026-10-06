package br.com.synctempo.usuario.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarUsuarioRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 320) String email) {
}
