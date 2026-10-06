package br.com.synctempo.security.user;

import br.com.synctempo.domain.entity.Usuario;
import br.com.synctempo.domain.enums.PerfilGlobal;
import java.io.Serial;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public final class UsuarioPrincipal implements UserDetails, CredentialsContainer {
    @Serial
    private static final long serialVersionUID = 1L;

    private final Long id;
    private final String email;
    private String senhaHash;
    private final boolean ativo;
    private final PerfilGlobal perfil;

    public UsuarioPrincipal(Usuario usuario) {
        this.id = usuario.getId();
        this.email = usuario.getEmail();
        this.senhaHash = usuario.getSenhaHash();
        this.ativo = usuario.isAtivo();
        this.perfil = usuario.getPerfil();
    }

    public Long getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + perfil.name()));
    }

    @Override
    public String getPassword() {
        return senhaHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return ativo;
    }

    @Override
    public void eraseCredentials() {
        senhaHash = null;
    }
}
