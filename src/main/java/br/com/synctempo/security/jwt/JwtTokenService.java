package br.com.synctempo.security.jwt;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {
    private final JwtEncoder encoder;
    private final String issuer;
    private final String audience;
    private final Duration ttl;

    public JwtTokenService(
            JwtEncoder encoder,
            @Value("${app.security.jwt.issuer}") String issuer,
            @Value("${app.security.jwt.audience}") String audience,
            @Value("${app.security.jwt.access-token-ttl}") String ttl) {
        this.encoder = encoder;
        this.issuer = issuer;
        this.audience = audience;
        this.ttl = Duration.parse(ttl);
        if (issuer.isBlank() || audience.isBlank() || this.ttl.isNegative() || this.ttl.isZero()
                || this.ttl.compareTo(Duration.ofHours(2)) > 0) {
            throw new IllegalStateException("Configuracao JWT invalida");
        }
    }

    public TokenEmitido emitir(Long usuarioId) {
        Instant agora = Instant.now();
        Instant expiraEm = agora.plus(ttl);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .audience(List.of(audience))
                .subject(usuarioId.toString())
                .issuedAt(agora)
                .expiresAt(expiraEm)
                .id(UUID.randomUUID().toString())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String valor = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new TokenEmitido(valor, expiraEm);
    }

    public record TokenEmitido(String valor, Instant expiraEm) {
    }
}
