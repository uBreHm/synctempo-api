package br.com.synctempo.categoria.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank @Size(max = 80) String nome,
        @NotBlank @Pattern(regexp = "#[0-9A-Fa-f]{6}") String cor) {
}
