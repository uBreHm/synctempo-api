package br.com.synctempo.calendario;

import br.com.synctempo.calendario.dto.request.CriarCalendarioRequest;
import br.com.synctempo.calendario.dto.response.CalendarioPageResponse;
import br.com.synctempo.calendario.dto.response.CalendarioResponse;
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
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/calendarios")
@Tag(name = "Calendários")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class CalendarioController {
    private final CalendarioService service;

    public CalendarioController(CalendarioService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Criar calendário")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Calendário criado; o criador recebe papel ADMIN.",
                    content = @Content(schema = @Schema(implementation = CalendarioResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<CalendarioResponse> criar(@Valid @RequestBody CriarCalendarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @GetMapping
    @Operation(summary = "Listar meus calendários")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de calendários dos quais a conta participa.",
                    content = @Content(schema = @Schema(implementation = CalendarioPageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Paginação inválida; tamanho permitido de 1 a 100.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public CalendarioPageResponse listar(
            @Parameter(description = "Índice da página, começando em zero.",
                    schema = @Schema(minimum = "0", defaultValue = "0"))
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Quantidade de itens por página.",
                    schema = @Schema(minimum = "1", maximum = "100", defaultValue = "20"))
            @RequestParam(defaultValue = "20") int size) {
        return service.listar(page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar calendário")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados do calendário.",
                    content = @Content(schema = @Schema(implementation = CalendarioResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não participa deste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Calendário inexistente.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public CalendarioResponse obter(@PathVariable Long id) {
        return service.obter(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar calendário")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Calendário atualizado.",
                    content = @Content(schema = @Schema(implementation = CalendarioResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Somente ADMIN pode administrar o calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Calendário inexistente.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public CalendarioResponse atualizar(@PathVariable Long id, @Valid @RequestBody CriarCalendarioRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir calendário")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Calendário excluído.", content = @Content),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Somente ADMIN pode administrar o calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
