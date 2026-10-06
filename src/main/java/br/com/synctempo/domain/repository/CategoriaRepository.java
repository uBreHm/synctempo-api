package br.com.synctempo.domain.repository;

import br.com.synctempo.domain.entity.Categoria;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    Page<Categoria> findAllByCalendario_Id(Long calendarioId, Pageable pageable);

    Optional<Categoria> findByIdAndCalendario_Id(Long id, Long calendarioId);
}
