package br.com.synctempo.domain.repository;

import br.com.synctempo.domain.enums.PapelCalendario;
import br.com.synctempo.domain.entity.MembroCalendario;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MembroCalendarioRepository extends JpaRepository<MembroCalendario, Long> {
    boolean existsByUsuario_IdAndPapel(Long usuarioId, PapelCalendario papel);

    @Query("select m.papel from MembroCalendario m "
            + "where m.calendario.id = :calendarioId and m.usuario.id = :usuarioId")
    Optional<PapelCalendario> findPapel(
            @Param("calendarioId") Long calendarioId,
            @Param("usuarioId") Long usuarioId);

    @Query("select m from MembroCalendario m where m.calendario.id = :calendarioId "
            + "and (lower(m.usuario.nome) like :busca or lower(m.usuario.email) like :busca)")
    Page<MembroCalendario> buscar(
            @Param("calendarioId") Long calendarioId,
            @Param("busca") String busca,
            Pageable pageable);

    Page<MembroCalendario> findAllByUsuario_Id(Long usuarioId, Pageable pageable);

    Optional<MembroCalendario> findByIdAndCalendario_Id(Long id, Long calendarioId);

    long countByCalendario_IdAndPapel(Long calendarioId, PapelCalendario papel);
}
