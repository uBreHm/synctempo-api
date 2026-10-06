package br.com.synctempo.security.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.com.synctempo.security.jwt.JwtTokenService;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;

class JwtConfigTest {
    private final JwtConfig config = new JwtConfig();

    @Test
    void validatesIssuedTokenAndRejectsWrongClaims() {
        SecretKey key = config.jwtSecretKey(Base64.getEncoder().encodeToString(new byte[32]));
        JwtEncoder encoder = config.jwtEncoder(key);
        JwtDecoder decoder = config.jwtDecoder(key, "synctempo-api", "synctempo-api");
        JwtTokenService tokens = new JwtTokenService(encoder, "synctempo-api", "synctempo-api", "PT15M");

        JwtTokenService.TokenEmitido issued = tokens.emitir(42L);
        assertEquals("42", decoder.decode(issued.valor()).getSubject());
        assertTrue(issued.expiraEm().isAfter(Instant.now()));

        assertThrows(JwtException.class,
                () -> decoder.decode(sign(encoder, "outro-issuer", "synctempo-api", false)));
        assertThrows(JwtException.class,
                () -> decoder.decode(sign(encoder, "synctempo-api", "outra-api", false)));
        assertThrows(JwtException.class,
                () -> decoder.decode(sign(encoder, "synctempo-api", "synctempo-api", true)));
    }

    @Test
    void rejectsWeakSigningKey() {
        String weakKey = Base64.getEncoder().encodeToString(new byte[16]);
        assertThrows(IllegalStateException.class, () -> config.jwtSecretKey(weakKey));
    }

    private String sign(JwtEncoder encoder, String issuer, String audience, boolean expired) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .audience(List.of(audience))
                .subject("42")
                .issuedAt(now.minusSeconds(300))
                .expiresAt(expired ? now.minusSeconds(120) : now.plusSeconds(300))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
