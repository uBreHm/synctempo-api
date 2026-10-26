package br.com.synctempo.domain.entity;

import br.com.synctempo.domain.enums.PapelCalendario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;

@Entity
@Table(name = "membro_calendario", uniqueConstraints = @UniqueConstraint(name = "uk_membro_calendario_usuario", columnNames = {"calendario_id", "usuario_id"}))
public class MembroCalendario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "calendario_id", nullable = false)
    private Calendario calendario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PapelCalendario papel;

    @Column(name = "entrou_em", nullable = false, updatable = false)
    private LocalDateTime entrouEm;

    protected MembroCalendario() {
    }

    public static MembroCalendario administrador(Calendario calendario, Usuario usuario) {
        MembroCalendario membro = new MembroCalendario();
        membro.calendario = calendario;
        membro.usuario = usuario;
        membro.papel = PapelCalendario.ADMIN;
        return membro;
    }

    public static MembroCalendario criar(Calendario calendario, Usuario usuario, PapelCalendario papel) {
        MembroCalendario membro = new MembroCalendario();
        membro.calendario = calendario;
        membro.usuario = usuario;
        membro.papel = papel;
        return membro;
    }

    public Long getId() { return id; }
    public Calendario getCalendario() { return calendario; }
    public Usuario getUsuario() { return usuario; }
    public PapelCalendario getPapel() { return papel; }
    public LocalDateTime getEntrouEm() { return entrouEm; }

    public void alterarPapel(PapelCalendario papel) {
        this.papel = papel;
    }

    public boolean isAdmin() {
        return papel == PapelCalendario.ADMIN;
    }

    public boolean podeCriarEventos() {
        return papel == PapelCalendario.ADMIN || papel == PapelCalendario.EDITOR;
    }

    @PrePersist
    void prepararInclusao() {
        entrouEm = LocalDateTime.now();
    }
}
