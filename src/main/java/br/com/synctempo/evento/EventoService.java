package br.com.synctempo.evento;

import br.com.synctempo.domain.entity.Calendario;
import br.com.synctempo.domain.entity.Categoria;
import br.com.synctempo.domain.entity.Evento;
import br.com.synctempo.domain.entity.Usuario;
import br.com.synctempo.domain.repository.CalendarioRepository;
import br.com.synctempo.domain.repository.CategoriaRepository;
import br.com.synctempo.domain.repository.EventoRepository;
import br.com.synctempo.domain.repository.UsuarioRepository;
import br.com.synctempo.evento.dto.request.EventoRequest;
import br.com.synctempo.evento.dto.response.EventoPageResponse;
import br.com.synctempo.evento.dto.response.EventoResponse;
import br.com.synctempo.security.authorization.CalendarioAuthorizationService;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service
public class EventoService {
    private static final Logger log = LoggerFactory.getLogger(EventoService.class);

    private final EventoRepository eventos;
    private final CalendarioRepository calendarios;
    private final CategoriaRepository categorias;
    private final UsuarioRepository usuarios;
    private final CalendarioAuthorizationService autorizacao;

    public EventoService(EventoRepository eventos, CalendarioRepository calendarios,
            CategoriaRepository categorias, UsuarioRepository usuarios,
            CalendarioAuthorizationService autorizacao) {
        this.eventos = eventos;
        this.calendarios = calendarios;
        this.categorias = categorias;
        this.usuarios = usuarios;
        this.autorizacao = autorizacao;
    }

    @Transactional
    public EventoResponse criar(Long calendarioId, EventoRequest request) {
        autorizacao.exigirEdicao(calendarioId);
        validarHorario(request);
        Calendario calendario = calendarios.findById(calendarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Usuario criador = usuarios.findById(autorizacao.usuarioAtualId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Evento evento = Evento.criar(calendario, criador);
        preencher(evento, calendarioId, request);
        eventos.save(evento);
        log.info("Evento {} criado no calendario {} pelo usuario {}", evento.getId(), calendarioId, criador.getId());
        return EventoResponse.from(evento);
    }

    @Transactional(readOnly = true)
    public EventoPageResponse listar(Long calendarioId, int pagina, int tamanho) {
        autorizacao.exigirLeitura(calendarioId);
        if (pagina < 0 || tamanho < 1 || tamanho > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paginacao invalida");
        }
        return EventoPageResponse.from(eventos.findAllByCalendario_Id(calendarioId,
                PageRequest.of(pagina, tamanho, Sort.by("dataEvento", "horaInicio")))
                .map(this::response));
    }

    @Transactional(readOnly = true)
    public EventoResponse obter(Long calendarioId, Long id) {
        autorizacao.exigirLeitura(calendarioId);
        return response(encontrar(calendarioId, id));
    }

    @Transactional
    public EventoResponse atualizar(Long calendarioId, Long id, EventoRequest request) {
        autorizacao.exigirEdicao(calendarioId);
        validarHorario(request);
        Evento evento = encontrar(calendarioId, id);
        preencher(evento, calendarioId, request);
        log.info("Evento {} atualizado no calendario {}", id, calendarioId);
        return EventoResponse.from(evento);
    }

    @Transactional
    public void excluir(Long calendarioId, Long id) {
        autorizacao.exigirEdicao(calendarioId);
        eventos.delete(encontrar(calendarioId, id));
        log.info("Evento {} excluido do calendario {}", id, calendarioId);
    }

    private void preencher(Evento evento, Long calendarioId, EventoRequest request) {
        evento.atualizar(request.titulo(), request.descricao(), request.localizacao(), request.linkReuniao(),
                request.dataEvento(), request.horaInicio(), request.horaFim(), request.diaInteiro(),
                request.visibilidade(), categoriasDoCalendario(calendarioId, request.categoriaIds()));
    }

    private Set<Categoria> categoriasDoCalendario(Long calendarioId, Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new LinkedHashSet<>();
        }
        List<Categoria> encontradas = categorias.findAllByCalendario_IdAndIdIn(calendarioId, ids);
        if (encontradas.size() != ids.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria nao pertence ao calendario");
        }
        return new LinkedHashSet<>(encontradas);
    }

    private void validarHorario(EventoRequest request) {
        boolean horarioAusente = request.horaInicio() == null && request.horaFim() == null;
        if (request.diaInteiro() && horarioAusente) return;
        if (!request.diaInteiro() && request.horaInicio() != null && request.horaFim() != null
                && request.horaFim().isAfter(request.horaInicio())) return;
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Evento deve ser de dia inteiro sem horario ou ter horario valido");
    }

    private EventoResponse response(Evento evento) {
        if (evento.isSomenteOcupado() && !evento.getCriadoPor().getId().equals(autorizacao.usuarioAtualId())) {
            return EventoResponse.ocupado(evento);
        }
        return EventoResponse.from(evento);
    }

    private Evento encontrar(Long calendarioId, Long id) {
        return eventos.findByIdAndCalendario_Id(id, calendarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento inexistente"));
    }
}
