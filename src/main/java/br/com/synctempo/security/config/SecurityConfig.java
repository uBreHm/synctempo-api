package br.com.synctempo.security.config;

import br.com.synctempo.security.handler.SecurityErrorResponses;
import br.com.synctempo.security.jwt.UsuarioJwtAuthenticationConverter;
import br.com.synctempo.security.user.UsuarioDetailsService;
import jakarta.servlet.DispatcherType;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
@EnableScheduling
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            UsuarioJwtAuthenticationConverter jwtConverter) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint(SecurityErrorResponses::unauthorized)
                        .accessDeniedHandler(SecurityErrorResponses::forbidden))
                .authorizeHttpRequests(authorize -> authorize
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/swagger-ui.html", "/swagger-ui/**",
                                "/v3/api-docs", "/v3/api-docs/**", "/v3/api-docs.yaml").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .authenticationEntryPoint(SecurityErrorResponses::unauthorized)
                        .accessDeniedHandler(SecurityErrorResponses::forbidden)
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter)))
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    AuthenticationManager authenticationManager(UsuarioDetailsService usuarios, PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(usuarios);
        provider.setPasswordEncoder(encoder);
        return new ProviderManager(provider);
    }

    @Bean
    UrlBasedCorsConfigurationSource corsConfigurationSource(
            @Value("${app.security.cors.allowed-origins:}") String allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        if (!allowedOrigins.isBlank()) {
            List<String> origins = Arrays.stream(allowedOrigins.split(","))
                    .map(String::strip)
                    .filter(origin -> !origin.isEmpty())
                    .toList();
            for (String origin : origins) {
                URI uri;
                try {
                    uri = URI.create(origin);
                } catch (IllegalArgumentException ex) {
                    throw new IllegalStateException("Origem CORS invalida", ex);
                }
                if (!("http".equals(uri.getScheme()) || "https".equals(uri.getScheme()))
                        || uri.getHost() == null || uri.getUserInfo() != null
                        || (uri.getRawPath() != null && !uri.getRawPath().isEmpty())
                        || uri.getRawQuery() != null || uri.getRawFragment() != null) {
                    throw new IllegalStateException("Origem CORS deve ser uma origem HTTP exata");
                }
            }
            config.setAllowedOrigins(origins);
        }
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("WWW-Authenticate"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
