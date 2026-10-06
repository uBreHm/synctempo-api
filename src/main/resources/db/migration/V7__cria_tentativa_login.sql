CREATE TABLE tentativa_login (
    identificador CHAR(64) PRIMARY KEY,
    inicio_janela TIMESTAMPTZ NOT NULL,
    tentativas INTEGER NOT NULL,
    CONSTRAINT ck_tentativa_login_contagem CHECK (tentativas BETWEEN 1 AND 11)
);

CREATE INDEX idx_tentativa_login_inicio_janela ON tentativa_login (inicio_janela);
