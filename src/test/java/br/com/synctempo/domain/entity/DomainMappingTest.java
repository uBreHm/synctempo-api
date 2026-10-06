package br.com.synctempo.domain.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import br.com.synctempo.domain.enums.PapelCalendario;
import br.com.synctempo.domain.enums.PerfilGlobal;
import br.com.synctempo.domain.enums.Visibilidade;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import org.junit.jupiter.api.Test;

class DomainMappingTest {

    @Test
    void exposesExpectedDomainEnums() {
        assertEquals(2, PerfilGlobal.values().length);
        assertEquals(3, PapelCalendario.values().length);
        assertEquals(2, Visibilidade.values().length);
    }

    @Test
    void mapsCalendarCollectionsAndEventCategories() throws NoSuchFieldException {
        assertTrue(Calendario.class.getDeclaredField("membros").isAnnotationPresent(OneToMany.class));
        assertTrue(Calendario.class.getDeclaredField("eventos").isAnnotationPresent(OneToMany.class));
        assertTrue(Evento.class.getDeclaredField("categorias").isAnnotationPresent(ManyToMany.class));
    }
}
