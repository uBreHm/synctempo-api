package br.com.synctempo.membro;

import br.com.synctempo.membro.dto.response.ParticipacaoPageResponse;
import br.com.synctempo.api.dto.response.ApiError;
import br.com.synctempo.api.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/usuarios/me/calendarios")
@Tag(name = "Membros")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ParticipacaoController {
    private final MembroService service;

    public ParticipacaoController(MembroService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar meus calendários com meu papel")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de calendários com o papel da conta em cada um.",
                    content = @Content(schema = @Schema(implementation = ParticipacaoPageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Paginação inválida; tamanho permitido de 1 a 100.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ParticipacaoPageResponse listar(
            @Parameter(description = "Índice da página, começando em zero.",
                    schema = @Schema(minimum = "0", defaultValue = "0"))
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Quantidade de itens por página.",
                    schema = @Schema(minimum = "1", maximum = "100", defaultValue = "20"))
            @RequestParam(defaultValue = "20") int size) {
        return service.listarParticipacoes(page, size);
    }
}
