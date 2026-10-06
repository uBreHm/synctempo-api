package br.com.synctempo.security.ratelimit;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class LoginRateLimiter {
    private static final int MAX_TENTATIVAS = 10;
    private static final String CONTAR_TENTATIVA = """
            INSERT INTO tentativa_login (identificador, inicio_janela, tentativas)
            VALUES (?, CURRENT_TIMESTAMP, 1)
            ON CONFLICT (identificador) DO UPDATE SET
                inicio_janela = CASE
                    WHEN tentativa_login.inicio_janela <= CURRENT_TIMESTAMP - INTERVAL '15 minutes'
                    THEN CURRENT_TIMESTAMP ELSE tentativa_login.inicio_janela END,
                tentativas = CASE
                    WHEN tentativa_login.inicio_janela <= CURRENT_TIMESTAMP - INTERVAL '15 minutes'
                    THEN 1 ELSE LEAST(tentativa_login.tentativas + 1, 11) END
            RETURNING tentativas
            """;

    private final JdbcTemplate jdbc;
    private final SecretKey signingKey;

    public LoginRateLimiter(DataSource dataSource, SecretKey signingKey) {
        this.jdbc = new JdbcTemplate(dataSource);
        this.signingKey = signingKey;
    }

    public boolean permitir(String emailNormalizado) {
        Integer tentativas = jdbc.queryForObject(
                CONTAR_TENTATIVA, Integer.class, identificador(emailNormalizado));
        return tentativas != null && tentativas <= MAX_TENTATIVAS;
    }

    public void limpar(String emailNormalizado) {
        jdbc.update("DELETE FROM tentativa_login WHERE identificador = ?", identificador(emailNormalizado));
    }

    @Scheduled(cron = "0 0 * * * *")
    public void limparJanelasAntigas() {
        jdbc.update("DELETE FROM tentativa_login "
                + "WHERE inicio_janela < CURRENT_TIMESTAMP - INTERVAL '1 day'");
    }

    private String identificador(String emailNormalizado) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(signingKey);
            byte[] digest = mac.doFinal(("login:" + emailNormalizado).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Nao foi possivel calcular identificador de login", ex);
        }
    }
}
