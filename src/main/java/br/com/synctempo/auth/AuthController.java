package br.com.synctempo.auth;

import br.com.synctempo.auth.dto.request.LoginRequest;
import br.com.synctempo.auth.dto.request.RegisterRequest;
import br.com.synctempo.auth.dto.response.LoginResponse;
import br.com.synctempo.api.dto.response.ApiError;
import br.com.synctempo.usuario.dto.response.UsuarioResponse;
import br.com.synctempo.api.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação")
public class AuthController {
    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    @Operation(summary = "Cadastrar uma conta")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Conta criada.",
                    content = @Content(schema = @Schema(implementation = UsuarioResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou senha acima do limite aceito.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "Já existe uma conta com esse e-mail.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<UsuarioResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.registrar(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar e receber um JWT")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Credenciais válidas; token emitido.",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados da requisição inválidos.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "429", description = "Limite de tentativas de login excedido.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return auth.entrar(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Consultar a conta autenticada")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados da conta autenticada.",
                    content = @Content(schema = @Schema(implementation = UsuarioResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente, inválido ou conta inativa.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public UsuarioResponse me(@AuthenticationPrincipal Jwt jwt) {
        return auth.usuarioAtual(Long.valueOf(jwt.getSubject()));
    }
}
