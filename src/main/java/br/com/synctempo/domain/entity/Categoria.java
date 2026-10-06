package br.com.synctempo.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "categoria", uniqueConstraints = @UniqueConstraint(name = "uk_categoria_calendario_nome", columnNames = {"calendario_id", "nome"}))
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "calendario_id", nullable = false)
    private Calendario calendario;

    @Column(nullable = false, length = 80)
    private String nome;

    @Column(nullable = false, length = 7)
    private String cor;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    protected Categoria() {
    }

    public static Categoria criar(Calendario calendario, String nome, String cor) {
        Categoria categoria = new Categoria();
        categoria.calendario = calendario;
        categoria.nome = nome.strip();
        categoria.cor = cor;
        return categoria;
    }

    public void atualizar(String nome, String cor) {
        this.nome = nome.strip();
        this.cor = cor;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCor() { return cor; }

    @PrePersist
    void prepararInclusao() {
        criadoEm = LocalDateTime.now();
    }
}
