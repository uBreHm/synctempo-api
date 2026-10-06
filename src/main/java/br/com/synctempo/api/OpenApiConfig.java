package br.com.synctempo.api;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class OpenApiConfig {
    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    OpenAPI synctempoOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("SyncTempo API")
                        .version("0.0.1")
                        .description("API para contas, calendários e categorias. "
                                + "Use o token recebido em /auth/login nas operações protegidas."))
                .components(new Components().addSecuritySchemes(BEARER_AUTH,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
