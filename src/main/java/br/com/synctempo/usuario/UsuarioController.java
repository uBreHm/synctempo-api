package br.com.synctempo.usuario;

import br.com.synctempo.usuario.dto.request.AlterarSenhaRequest;
import br.com.synctempo.usuario.dto.request.AtualizarUsuarioRequest;
import br.com.synctempo.usuario.dto.response.UsuarioResponse;
import br.com.synctempo.api.dto.response.ApiError;
import br.com.synctempo.api.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/usuarios/me")
@Tag(name = "Usuário")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class UsuarioController {
    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Consultar minha conta")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados da conta autenticada.",
                    content = @Content(schema = @Schema(implementation = UsuarioResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória ou conta inativa.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public UsuarioResponse obter() {
        return service.obter();
    }

    @PutMapping
    @Operation(summary = "Atualizar minha conta")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados da conta atualizados.",
                    content = @Content(schema = @Schema(implementation = UsuarioResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória ou conta inativa.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "O e-mail informado já está cadastrado.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public UsuarioResponse atualizar(@Valid @RequestBody AtualizarUsuarioRequest request) {
        return service.atualizar(request);
    }

    @PutMapping("/senha")
    @Operation(summary = "Alterar minha senha")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Senha alterada.", content = @Content),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou senha acima do limite aceito.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória ou senha atual inválida.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<Void> alterarSenha(@Valid @RequestBody AlterarSenhaRequest request) {
        service.alterarSenha(request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Operation(summary = "Desativar minha conta")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Conta desativada.", content = @Content),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória ou conta inativa.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "Transfira a administração dos calendários antes de desativar.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<Void> desativar() {
        service.desativar();
        return ResponseEntity.noContent().build();
    }
}
