package br.com.synctempo.security.config;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class SecurityConfigTest {
    private final SecurityConfig config = new SecurityConfig();

    @Test
    void acceptsExactBrowserOriginsAndRejectsWildcard() {
        assertDoesNotThrow(() -> config.corsConfigurationSource(
                "http://localhost:3000,https://app.example.com"));
        assertThrows(IllegalStateException.class, () -> config.corsConfigurationSource("*"));
        assertThrows(IllegalStateException.class,
                () -> config.corsConfigurationSource("https://app.example.com/path"));
    }
}
