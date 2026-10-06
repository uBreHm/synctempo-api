package br.com.synctempo.calendario;

import br.com.synctempo.calendario.dto.request.CriarCalendarioRequest;
import br.com.synctempo.calendario.dto.response.CalendarioPageResponse;
import br.com.synctempo.calendario.dto.response.CalendarioResponse;
import br.com.synctempo.domain.entity.Calendario;
import br.com.synctempo.domain.entity.MembroCalendario;
import br.com.synctempo.domain.entity.Usuario;
import br.com.synctempo.domain.repository.CalendarioRepository;
import br.com.synctempo.domain.repository.MembroCalendarioRepository;
import br.com.synctempo.domain.repository.UsuarioRepository;
import br.com.synctempo.security.authorization.CalendarioAuthorizationService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service
public class CalendarioService {
    private final CalendarioRepository calendarios;
    private final MembroCalendarioRepository membros;
    private final UsuarioRepository usuarios;
    private final CalendarioAuthorizationService autorizacao;

    public CalendarioService(CalendarioRepository calendarios, MembroCalendarioRepository membros,
            UsuarioRepository usuarios, CalendarioAuthorizationService autorizacao) {
        this.calendarios = calendarios;
        this.membros = membros;
        this.usuarios = usuarios;
        this.autorizacao = autorizacao;
    }

    @Transactional
    public CalendarioResponse criar(CriarCalendarioRequest request) {
        Usuario criador = usuarios.findById(autorizacao.usuarioAtualId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Calendario calendario = calendarios.save(Calendario.criar(
                request.nome(), request.descricao(), request.cor(), criador));
        membros.save(MembroCalendario.administrador(calendario, criador));
        return CalendarioResponse.from(calendario);
    }

    @Transactional(readOnly = true)
    public CalendarioPageResponse listar(int pagina, int tamanho) {
        if (pagina < 0 || tamanho < 1 || tamanho > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paginacao invalida");
        }
        return CalendarioPageResponse.from(calendarios.findParticipados(autorizacao.usuarioAtualId(),
                PageRequest.of(pagina, tamanho, Sort.by(Sort.Direction.DESC, "id")))
                .map(CalendarioResponse::from));
    }

    @Transactional(readOnly = true)
    public CalendarioResponse obter(Long id) {
        autorizacao.exigirLeitura(id);
        return CalendarioResponse.from(calendarios.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendario inexistente")));
    }

    @Transactional
    public CalendarioResponse atualizar(Long id, CriarCalendarioRequest request) {
        autorizacao.exigirAdministracao(id);
        Calendario calendario = calendarios.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendario inexistente"));
        calendario.atualizar(request.nome(), request.descricao(), request.cor());
        return CalendarioResponse.from(calendario);
    }

    @Transactional
    public void excluir(Long id) {
        autorizacao.exigirAdministracao(id);
        calendarios.deleteById(id);
    }
}
