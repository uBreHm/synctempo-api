package br.com.synctempo.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 320) String email,
        @NotBlank @Size(min = 12, max = 72) @Schema(format = "password") String password) {
}
