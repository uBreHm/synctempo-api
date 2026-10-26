package br.com.synctempo.membro;

import br.com.synctempo.domain.entity.Calendario;
import br.com.synctempo.domain.entity.MembroCalendario;
import br.com.synctempo.domain.entity.Usuario;
import br.com.synctempo.domain.enums.PapelCalendario;
import br.com.synctempo.domain.repository.CalendarioRepository;
import br.com.synctempo.domain.repository.MembroCalendarioRepository;
import br.com.synctempo.domain.repository.UsuarioRepository;
import br.com.synctempo.membro.dto.request.AdicionarMembroRequest;
import br.com.synctempo.membro.dto.request.AlterarPapelRequest;
import br.com.synctempo.membro.dto.response.MembroPageResponse;
import br.com.synctempo.membro.dto.response.MembroResponse;
import br.com.synctempo.membro.dto.response.ParticipacaoPageResponse;
import br.com.synctempo.membro.dto.response.ParticipacaoResponse;
import br.com.synctempo.security.authorization.CalendarioAuthorizationService;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service
public class MembroService {
    private static final Logger log = LoggerFactory.getLogger(MembroService.class);

    private final MembroCalendarioRepository membros;
    private final CalendarioRepository calendarios;
    private final UsuarioRepository usuarios;
    private final CalendarioAuthorizationService autorizacao;

    public MembroService(MembroCalendarioRepository membros, CalendarioRepository calendarios,
            UsuarioRepository usuarios, CalendarioAuthorizationService autorizacao) {
        this.membros = membros;
        this.calendarios = calendarios;
        this.usuarios = usuarios;
        this.autorizacao = autorizacao;
    }

    @Transactional
    public MembroResponse adicionar(Long calendarioId, AdicionarMembroRequest request) {
        autorizacao.exigirAdministracao(calendarioId);
        Calendario calendario = calendarios.findById(calendarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Usuario usuario = usuarios.findByEmail(request.email().strip().toLowerCase(Locale.ROOT))
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario inexistente"));
        try {
            MembroCalendario membro = membros.saveAndFlush(
                    MembroCalendario.criar(calendario, usuario, request.papel()));
            log.info("Usuario {} adicionado ao calendario {} como {}", usuario.getId(), calendarioId, request.papel());
            return MembroResponse.from(membro);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuario ja participa do calendario");
        }
    }

    @Transactional(readOnly = true)
    public MembroPageResponse listar(Long calendarioId, String busca, int pagina, int tamanho) {
        autorizacao.exigirLeitura(calendarioId);
        if (pagina < 0 || tamanho < 1 || tamanho > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paginacao invalida");
        }
        String termo = busca == null ? "" : busca.strip().toLowerCase(Locale.ROOT);
        return MembroPageResponse.from(membros.buscar(calendarioId, "%" + termo + "%",
                PageRequest.of(pagina, tamanho, Sort.by("id")))
                .map(MembroResponse::from));
    }

    @Transactional(readOnly = true)
    public MembroResponse obter(Long calendarioId, Long id) {
        autorizacao.exigirLeitura(calendarioId);
        return MembroResponse.from(encontrar(calendarioId, id));
    }

    @Transactional
    public MembroResponse alterarPapel(Long calendarioId, Long id, AlterarPapelRequest request) {
        autorizacao.exigirAdministracao(calendarioId);
        MembroCalendario membro = encontrar(calendarioId, id);
        if (membro.isAdmin() && request.papel() != PapelCalendario.ADMIN) {
            exigirOutroAdmin(calendarioId);
        }
        membro.alterarPapel(request.papel());
        log.info("Membro {} do calendario {} alterado para {}", id, calendarioId, request.papel());
        return MembroResponse.from(membro);
    }

    @Transactional
    public void remover(Long calendarioId, Long id) {
        autorizacao.exigirAdministracao(calendarioId);
        MembroCalendario membro = encontrar(calendarioId, id);
        if (membro.isAdmin()) {
            exigirOutroAdmin(calendarioId);
        }
        membros.delete(membro);
        log.info("Membro {} removido do calendario {}", id, calendarioId);
    }

    @Transactional(readOnly = true)
    public ParticipacaoPageResponse listarParticipacoes(int pagina, int tamanho) {
        if (pagina < 0 || tamanho < 1 || tamanho > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paginacao invalida");
        }
        return ParticipacaoPageResponse.from(membros.findAllByUsuario_Id(autorizacao.usuarioAtualId(),
                PageRequest.of(pagina, tamanho, Sort.by(Sort.Direction.DESC, "calendario.id")))
                .map(ParticipacaoResponse::from));
    }

    private void exigirOutroAdmin(Long calendarioId) {
        if (membros.countByCalendario_IdAndPapel(calendarioId, PapelCalendario.ADMIN) <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "O calendario precisa de pelo menos um ADMIN");
        }
    }

    private MembroCalendario encontrar(Long calendarioId, Long id) {
        return membros.findByIdAndCalendario_Id(id, calendarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro inexistente"));
    }
}
