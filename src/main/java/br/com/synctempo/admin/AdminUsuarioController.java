package br.com.synctempo.admin;

import br.com.synctempo.admin.dto.response.UsuarioAdminPageResponse;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/usuarios")
@Tag(name = "Administração")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
@PreAuthorize("hasRole('ADMIN_SISTEMA')")
public class AdminUsuarioController {
    private final AdminUsuarioService service;

    public AdminUsuarioController(AdminUsuarioService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar contas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de contas cadastradas.",
                    content = @Content(schema = @Schema(implementation = UsuarioAdminPageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Paginação inválida; tamanho permitido de 1 a 100.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Somente ADMIN_SISTEMA pode administrar contas.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public UsuarioAdminPageResponse listar(
            @Parameter(description = "Índice da página, começando em zero.",
                    schema = @Schema(minimum = "0", defaultValue = "0"))
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Quantidade de itens por página.",
                    schema = @Schema(minimum = "1", maximum = "100", defaultValue = "20"))
            @RequestParam(defaultValue = "20") int size) {
        return service.listar(page, size);
    }

    @PatchMapping("/{id}/ativar")
    @Operation(summary = "Reativar conta")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Conta reativada.", content = @Content),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Somente ADMIN_SISTEMA pode administrar contas.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Conta inexistente.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<Void> ativar(@PathVariable Long id) {
        service.ativar(id);
        return ResponseEntity.noContent().build();
    }
}
