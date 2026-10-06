package br.com.synctempo.categoria;

import br.com.synctempo.categoria.dto.request.CategoriaRequest;
import br.com.synctempo.categoria.dto.response.CategoriaPageResponse;
import br.com.synctempo.categoria.dto.response.CategoriaResponse;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/calendarios/{calendarioId}/categorias")
@Tag(name = "Categorias")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class CategoriaController {
    private final CategoriaService service;

    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Criar categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Categoria criada no calendário.",
                    content = @Content(schema = @Schema(implementation = CategoriaResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não pode editar este calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Calendário inexistente.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "Já existe categoria com esse nome no calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<CategoriaResponse> criar(@PathVariable Long calendarioId,
            @Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(calendarioId, request));
    }

    @GetMapping
    @Operation(summary = "Listar categorias do calendário")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de categorias do calendário.",
                    content = @Content(schema = @Schema(implementation = CategoriaPageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Paginação inválida; tamanho permitido de 1 a 100.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não participa deste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public CategoriaPageResponse listar(@PathVariable Long calendarioId,
            @Parameter(description = "Índice da página, começando em zero.",
                    schema = @Schema(minimum = "0", defaultValue = "0"))
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Quantidade de itens por página.",
                    schema = @Schema(minimum = "1", maximum = "100", defaultValue = "20"))
            @RequestParam(defaultValue = "20") int size) {
        return service.listar(calendarioId, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados da categoria.",
                    content = @Content(schema = @Schema(implementation = CategoriaResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não participa deste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Categoria inexistente neste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public CategoriaResponse obter(@PathVariable Long calendarioId, @PathVariable Long id) {
        return service.obter(calendarioId, id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoria atualizada.",
                    content = @Content(schema = @Schema(implementation = CategoriaResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não pode editar este calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Categoria inexistente neste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "Já existe categoria com esse nome no calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public CategoriaResponse atualizar(@PathVariable Long calendarioId, @PathVariable Long id,
            @Valid @RequestBody CategoriaRequest request) {
        return service.atualizar(calendarioId, id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir categoria")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Categoria excluída.", content = @Content),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não pode editar este calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Categoria inexistente neste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<Void> excluir(@PathVariable Long calendarioId, @PathVariable Long id) {
        service.excluir(calendarioId, id);
        return ResponseEntity.noContent().build();
    }
}
