package br.com.synctempo.evento;

import br.com.synctempo.evento.dto.request.EventoRequest;
import br.com.synctempo.evento.dto.response.EventoPageResponse;
import br.com.synctempo.evento.dto.response.EventoResponse;
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
@RequestMapping("/calendarios/{calendarioId}/eventos")
@Tag(name = "Eventos")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class EventoController {
    private final EventoService service;

    public EventoController(EventoService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Criar evento")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Evento criado no calendário.",
                    content = @Content(schema = @Schema(implementation = EventoResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos, horário inválido ou categoria de outro calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não pode editar este calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<EventoResponse> criar(@PathVariable Long calendarioId,
            @Valid @RequestBody EventoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(calendarioId, request));
    }

    @GetMapping
    @Operation(summary = "Listar eventos do calendário")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de eventos ordenada por data e horário.",
                    content = @Content(schema = @Schema(implementation = EventoPageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Paginação inválida; tamanho permitido de 1 a 100.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não participa deste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public EventoPageResponse listar(@PathVariable Long calendarioId,
            @Parameter(description = "Índice da página, começando em zero.",
                    schema = @Schema(minimum = "0", defaultValue = "0"))
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Quantidade de itens por página.",
                    schema = @Schema(minimum = "1", maximum = "100", defaultValue = "20"))
            @RequestParam(defaultValue = "20") int size) {
        return service.listar(calendarioId, page, size);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar evento")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados do evento; eventos SOMENTE_OCUPADO de outra conta aparecem como \"Ocupado\".",
                    content = @Content(schema = @Schema(implementation = EventoResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não participa deste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Evento inexistente neste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public EventoResponse obter(@PathVariable Long calendarioId, @PathVariable Long id) {
        return service.obter(calendarioId, id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar evento")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Evento atualizado.",
                    content = @Content(schema = @Schema(implementation = EventoResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos, horário inválido ou categoria de outro calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não pode editar este calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Evento inexistente neste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public EventoResponse atualizar(@PathVariable Long calendarioId, @PathVariable Long id,
            @Valid @RequestBody EventoRequest request) {
        return service.atualizar(calendarioId, id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir evento")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Evento excluído.", content = @Content),
            @ApiResponse(responseCode = "401", description = "Autenticação obrigatória.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "403", description = "A conta não pode editar este calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class))),
            @ApiResponse(responseCode = "404", description = "Evento inexistente neste calendário.",
                    content = @Content(schema = @Schema(implementation = ApiError.class)))
    })
    public ResponseEntity<Void> excluir(@PathVariable Long calendarioId, @PathVariable Long id) {
        service.excluir(calendarioId, id);
        return ResponseEntity.noContent().build();
    }
}
