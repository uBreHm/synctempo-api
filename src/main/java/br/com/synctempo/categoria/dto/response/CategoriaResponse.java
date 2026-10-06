package br.com.synctempo.categoria.dto.response;

import br.com.synctempo.domain.entity.Categoria;

public record CategoriaResponse(Long id, String nome, String cor) {
    public static CategoriaResponse from(Categoria categoria) {
        return new CategoriaResponse(categoria.getId(), categoria.getNome(), categoria.getCor());
    }
}
