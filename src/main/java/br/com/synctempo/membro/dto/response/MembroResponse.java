package br.com.synctempo.membro.dto.response;

import br.com.synctempo.domain.entity.MembroCalendario;
import br.com.synctempo.domain.enums.PapelCalendario;
import java.time.LocalDateTime;

public record MembroResponse(Long id, Long usuarioId, String nome, String email, PapelCalendario papel,
        LocalDateTime entrouEm) {
    public static MembroResponse from(MembroCalendario membro) {
        return new MembroResponse(membro.getId(), membro.getUsuario().getId(), membro.getUsuario().getNome(),
                membro.getUsuario().getEmail(), membro.getPapel(), membro.getEntrouEm());
    }
}
