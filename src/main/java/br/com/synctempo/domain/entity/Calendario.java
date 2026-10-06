package br.com.synctempo.domain.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "calendario")
public class Calendario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(length = 1_000)
    private String descricao;

    @Column(nullable = false, length = 7)
    private String cor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "criado_por_id", nullable = false)
    private Usuario criadoPor;

    @OneToMany(mappedBy = "calendario", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MembroCalendario> membros = new LinkedHashSet<>();

    @OneToMany(mappedBy = "calendario", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Categoria> categorias = new LinkedHashSet<>();

    @OneToMany(mappedBy = "calendario", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Evento> eventos = new LinkedHashSet<>();

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    protected Calendario() {
    }

    public static Calendario criar(String nome, String descricao, String cor, Usuario criador) {
        Calendario calendario = new Calendario();
        calendario.nome = nome.strip();
        calendario.descricao = descricao == null ? null : descricao.strip();
        calendario.cor = cor;
        calendario.criadoPor = criador;
        return calendario;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public String getCor() { return cor; }
    public Usuario getCriadoPor() { return criadoPor; }

    public void atualizar(String nome, String descricao, String cor) {
        this.nome = nome.strip();
        this.descricao = descricao == null ? null : descricao.strip();
        this.cor = cor;
    }

    @PrePersist
    void prepararInclusao() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = criadoEm;
    }

    @PreUpdate
    void prepararAtualizacao() {
        atualizadoEm = LocalDateTime.now();
    }
}
