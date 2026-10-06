package br.com.synctempo.domain.entity;

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
import java.util.Locale;

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

    public static Usuario cadastrar(String nome, String email, String senhaHash) {
        Usuario usuario = new Usuario();
        usuario.nome = nome.strip();
        usuario.email = email.strip().toLowerCase(Locale.ROOT);
        usuario.senhaHash = senhaHash;
        return usuario;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public PerfilGlobal getPerfil() {
        return perfil;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void atualizarPerfil(String nome, String email) {
        this.nome = nome.strip();
        this.email = email.strip().toLowerCase(Locale.ROOT);
    }

    public void alterarSenha(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public void desativar() {
        this.ativo = false;
    }

    @PrePersist
    void prepararInclusao() {
        criadoEm = LocalDateTime.now();
        atualizadoEm = criadoEm;
        email = email.toLowerCase(Locale.ROOT);
    }

    @PreUpdate
    void prepararAtualizacao() {
        atualizadoEm = LocalDateTime.now();
        email = email.toLowerCase(Locale.ROOT);
    }
}
