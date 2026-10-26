package br.com.synctempo.membro.dto.response;

import br.com.synctempo.domain.entity.MembroCalendario;
import br.com.synctempo.domain.enums.PapelCalendario;

public record ParticipacaoResponse(Long calendarioId, String nome, String descricao, String cor,
        PapelCalendario papel) {
    public static ParticipacaoResponse from(MembroCalendario membro) {
        return new ParticipacaoResponse(membro.getCalendario().getId(), membro.getCalendario().getNome(),
                membro.getCalendario().getDescricao(), membro.getCalendario().getCor(), membro.getPapel());
    }
}
