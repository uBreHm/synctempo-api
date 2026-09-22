package br.com.synctempo.domain.model;

import br.com.synctempo.domain.enums.PerfilGlobal;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 320)
    private String email;

    @Column(name = "senha", nullable = false, length = 100)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PerfilGlobal perfil = PerfilGlobal.USUARIO;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    protected Usuario() {
    }

    @PrePersist
    void prepararInclusao() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = criadoEm;
        email = email.toLowerCase(java.util.Locale.ROOT);
    }

    @PreUpdate
    void prepararAtualizacao() {
        atualizadoEm = LocalDateTime.now();
        email = email.toLowerCase(java.util.Locale.ROOT);
    }
}
