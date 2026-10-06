package br.com.synctempo.domain.repository;

import br.com.synctempo.domain.entity.Calendario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CalendarioRepository extends JpaRepository<Calendario, Long> {
    @Query("select c from Calendario c join c.membros m where m.usuario.id = :usuarioId")
    Page<Calendario> findParticipados(@Param("usuarioId") Long usuarioId, Pageable pageable);
}
