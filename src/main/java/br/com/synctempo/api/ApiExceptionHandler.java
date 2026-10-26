package br.com.synctempo.api;

import br.com.synctempo.api.dto.response.ApiError;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> status(ResponseStatusException ex) {
        String code = HttpStatus.valueOf(ex.getStatusCode().value()).name();
        String message = ex.getReason() == null ? "Requisicao nao concluida" : ex.getReason();
        return ResponseEntity.status(ex.getStatusCode()).body(new ApiError(code, message));
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiError> entradaInvalida(Exception ex) {
        return ResponseEntity.badRequest().body(new ApiError("BAD_REQUEST", "Dados invalidos"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> acessoNegado(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiError("FORBIDDEN", "Acesso negado"));
    }

    @ExceptionHandler(AuthenticationCredentialsNotFoundException.class)
    public ResponseEntity<ApiError> semAutenticacao(AuthenticationCredentialsNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiError("UNAUTHORIZED", "Autenticacao obrigatoria"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> erroInesperado(Exception ex) {
        if (ex instanceof ErrorResponse erro) {
            String code = HttpStatus.valueOf(erro.getStatusCode().value()).name();
            return ResponseEntity.status(erro.getStatusCode()).body(new ApiError(code, "Requisicao nao concluida"));
        }
        log.error("Erro inesperado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiError("INTERNAL_SERVER_ERROR", "Erro interno"));
    }
}
