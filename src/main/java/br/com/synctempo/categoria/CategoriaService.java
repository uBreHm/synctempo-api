package br.com.synctempo.categoria;

import br.com.synctempo.categoria.dto.request.CategoriaRequest;
import br.com.synctempo.categoria.dto.response.CategoriaPageResponse;
import br.com.synctempo.categoria.dto.response.CategoriaResponse;
import br.com.synctempo.domain.entity.Calendario;
import br.com.synctempo.domain.entity.Categoria;
import br.com.synctempo.domain.repository.CalendarioRepository;
import br.com.synctempo.domain.repository.CategoriaRepository;
import br.com.synctempo.security.authorization.CalendarioAuthorizationService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service
public class CategoriaService {
    private final CategoriaRepository categorias;
    private final CalendarioRepository calendarios;
    private final CalendarioAuthorizationService autorizacao;

    public CategoriaService(CategoriaRepository categorias, CalendarioRepository calendarios,
            CalendarioAuthorizationService autorizacao) {
        this.categorias = categorias;
        this.calendarios = calendarios;
        this.autorizacao = autorizacao;
    }

    @Transactional
    public CategoriaResponse criar(Long calendarioId, CategoriaRequest request) {
        autorizacao.exigirEdicao(calendarioId);
        Calendario calendario = calendarios.findById(calendarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        try {
            return CategoriaResponse.from(categorias.saveAndFlush(
                    Categoria.criar(calendario, request.nome(), request.cor())));
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Categoria ja cadastrada");
        }
    }

    @Transactional(readOnly = true)
    public CategoriaPageResponse listar(Long calendarioId, int pagina, int tamanho) {
        autorizacao.exigirLeitura(calendarioId);
        if (pagina < 0 || tamanho < 1 || tamanho > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paginacao invalida");
        }
        return CategoriaPageResponse.from(categorias.findAllByCalendario_Id(calendarioId,
                PageRequest.of(pagina, tamanho, Sort.by("id")))
                .map(CategoriaResponse::from));
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obter(Long calendarioId, Long id) {
        autorizacao.exigirLeitura(calendarioId);
        return CategoriaResponse.from(encontrar(calendarioId, id));
    }

    @Transactional
    public CategoriaResponse atualizar(Long calendarioId, Long id, CategoriaRequest request) {
        autorizacao.exigirEdicao(calendarioId);
        Categoria categoria = encontrar(calendarioId, id);
        categoria.atualizar(request.nome(), request.cor());
        try {
            categorias.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Categoria ja cadastrada");
        }
        return CategoriaResponse.from(categoria);
    }

    @Transactional
    public void excluir(Long calendarioId, Long id) {
        autorizacao.exigirEdicao(calendarioId);
        categorias.delete(encontrar(calendarioId, id));
    }

    private Categoria encontrar(Long calendarioId, Long id) {
        return categorias.findByIdAndCalendario_Id(id, calendarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria inexistente"));
    }
}
