package br.com.synctempo.domain.repository;

import br.com.synctempo.domain.entity.Evento;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoRepository extends JpaRepository<Evento, Long> {
    Page<Evento> findAllByCalendario_Id(Long calendarioId, Pageable pageable);

    Optional<Evento> findByIdAndCalendario_Id(Long id, Long calendarioId);
}
