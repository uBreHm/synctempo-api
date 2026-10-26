package br.com.synctempo.membro;

import br.com.synctempo.membro.dto.request.AdicionarMembroRequest;
import br.com.synctempo.membro.dto.request.AlterarPapelRequest;
import br.com.synctempo.membro.dto.response.MembroPageResponse;
import br.com.synctempo.membro.dto.response.MembroResponse;
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
@RequestMapping("/calendarios/{calendarioId}/membros")
@Tag(name = "Membros")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class MembroController {
    private final MembroService service;

    public MembroController(MembroService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Adicionar membro")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Conta adicionada ao calendário com o papel informado.",
                    content = @Content(schema = @Schema(implementation = MembroResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Somente ADMIN pode administrar o calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Não existe conta ativa com esse e-mail.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "A conta já participa do calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<MembroResponse> adicionar(@PathVariable Long calendarioId,
            @Valid @RequestBody AdicionarMembroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.adicionar(calendarioId, request));
    }

    @GetMapping
    @Operation(summary = "Listar membros do calendário")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de membros e seus papéis.",
                    content = @Content(schema = @Schema(implementation = MembroPageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Paginação inválida; tamanho permitido de 1 a 100.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não participa deste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public MembroPageResponse listar(@PathVariable Long calendarioId,
            @Parameter(description = "Trecho do nome ou do e-mail do membro.")
            @RequestParam(required = false) String busca,
            @Parameter(description = "Índice da página, começando em zero.",
                    schema = @Schema(minimum = "0", defaultValue = "0"))
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Quantidade de itens por página.",
                    schema = @Schema(minimum = "1", maximum = "100", defaultValue = "20"))
            @RequestParam(defaultValue = "20") int size) {
        return service.listar(calendarioId, busca, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar membro")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados do membro.",
                    content = @Content(schema = @Schema(implementation = MembroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não participa deste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Membro inexistente neste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public MembroResponse obter(@PathVariable Long calendarioId, @PathVariable Long id) {
        return service.obter(calendarioId, id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Alterar papel do membro")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Papel alterado.",
                    content = @Content(schema = @Schema(implementation = MembroResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Somente ADMIN pode administrar o calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Membro inexistente neste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "O calendário precisa de pelo menos um ADMIN.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public MembroResponse alterarPapel(@PathVariable Long calendarioId, @PathVariable Long id,
            @Valid @RequestBody AlterarPapelRequest request) {
        return service.alterarPapel(calendarioId, id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover membro")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Membro removido.", content = @Content),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "Somente ADMIN pode administrar o calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Membro inexistente neste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "409", description = "O calendário precisa de pelo menos um ADMIN.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<Void> remover(@PathVariable Long calendarioId, @PathVariable Long id) {
        service.remover(calendarioId, id);
        return ResponseEntity.noContent().build();
    }
}
