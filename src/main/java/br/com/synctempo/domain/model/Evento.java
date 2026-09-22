package br.com.synctempo.domain.model;

import br.com.synctempo.domain.enums.Visibilidade;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "evento")
public class Evento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "calendario_id", nullable = false)
    private Calendario calendario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "criado_por_id", nullable = false)
    private Usuario criadoPor;

    @Column(nullable = false, length = 160)
    private String titulo;

    @Column(length = 4_000)
    private String descricao;

    @Column(length = 255)
    private String localizacao;

    @Column(name = "link_reuniao", length = 2_048)
    private String linkReuniao;

    @Column(name = "data_evento", nullable = false)
    private LocalDate dataEvento;

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fim")
    private LocalTime horaFim;

    @Column(name = "dia_inteiro", nullable = false)
    private boolean diaInteiro;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Visibilidade visibilidade = Visibilidade.DETALHADA;

    @ManyToMany
    @JoinTable(name = "evento_categoria", joinColumns = @JoinColumn(name = "evento_id"), inverseJoinColumns = @JoinColumn(name = "categoria_id"))
    private Set<Categoria> categorias = new LinkedHashSet<>();

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    protected Evento() {
    }

    @PrePersist
    void prepararInclusao() {
        validarHorario();
        criadoEm = LocalDateTime.now();
        atualizadoEm = criadoEm;
    }

    @PreUpdate
    void prepararAtualizacao() {
        validarHorario();
        atualizadoEm = LocalDateTime.now();
    }

    private void validarHorario() {
        boolean horarioAusente = horaInicio == null && horaFim == null;
        if (diaInteiro && horarioAusente) return;
        if (!diaInteiro && horaInicio != null && horaFim != null && horaFim.isAfter(horaInicio)) return;
        throw new IllegalStateException("Evento deve ser de dia inteiro sem horario ou ter horario valido.");
    }
}
