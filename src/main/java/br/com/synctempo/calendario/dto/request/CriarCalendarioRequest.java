package br.com.synctempo.calendario.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CriarCalendarioRequest(
        @NotBlank @Size(max = 120) String nome,
        @Size(max = 1000) String descricao,
        @NotBlank @Pattern(regexp = "#[0-9A-Fa-f]{6}") String cor) {
}
