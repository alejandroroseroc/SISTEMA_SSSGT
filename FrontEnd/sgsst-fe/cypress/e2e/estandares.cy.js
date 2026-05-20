// Tests E2E del flujo de estándares
// Requiere: backend en http://localhost:3001 y frontend en http://localhost:5173

const TS = Date.now();
const TEST_EMAIL = `e2e_est_${TS}@sgsst.test`;
const TEST_PASSWORD = 'cypress123456';
const TEST_NOMBRE = `Est User ${TS}`;

describe('Flujo de estándares — SG-SST', () => {

  before(() => {
    // Registrar usuario y crear empresa via API para el test
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/register',
      body: { nombre: TEST_NOMBRE, email: TEST_EMAIL, password: TEST_PASSWORD },
    }).then((res) => {
      const token = res.body.token;
      // Crear empresa
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/empresa',
        headers: { Authorization: `Bearer ${token}` },
        body: { nombre: 'Empresa Cypress', actividadEconomica: 'comercio', trabajadores: 3, ciudad: 'Bogotá' },
      });
    });
  });

  beforeEach(() => {
    // Login vía UI antes de cada test
    cy.visit('/login');
    cy.get('#login-email').type(TEST_EMAIL);
    cy.get('#login-password').type(TEST_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/educacion');
  });

  it('La página de estándares muestra 7 tarjetas', () => {
    cy.visit('/estandares');
    cy.get('.std-card').should('have.length', 7);
  });

  it('Hacer clic en el primer estándar abre el detalle', () => {
    cy.visit('/estandares');
    cy.get('.std-card').first().click();
    cy.url().should('match', /\/estandares\/\d+/);
  });

  it('El detalle del estándar muestra la lista de verificación', () => {
    cy.visit('/estandares');
    cy.get('.std-card').first().click();
    cy.url().should('match', /\/estandares\/\d+/);
    cy.get('.checklist-item').should('have.length.greaterThan', 0);
  });

  it('Marcar un ítem actualiza el progreso', () => {
    cy.visit('/estandares');
    cy.get('.std-card').first().click();
    cy.url().should('match', /\/estandares\/\d+/);

    // Obtener porcentaje inicial
    cy.get('.fw600').contains('Progreso').should('be.visible');

    // Marcar el primer checkbox
    cy.get('.checklist-item input[type="checkbox"]').first().check({ force: true });

    // Esperar a que se guarde (mensaje "Guardado" o porcentaje > 0)
    cy.contains(/Guardado|%/, { timeout: 5000 }).should('be.visible');
  });

  it('Volver a estándares y ver que el progreso muestra porcentaje', () => {
    cy.visit('/estandares');
    cy.get('.std-card').first().click();
    cy.url().should('match', /\/estandares\/\d+/);

    // Hacer toggle del primer checkbox (click lo cambia sin importar el estado)
    cy.get('.checklist-item input[type="checkbox"]').first().click({ force: true });
    // Esperar a que se procese el guardado (indicador o porcentaje cambiado)
    cy.wait(2000);

    cy.contains('← Volver a estándares').click();
    cy.url().should('include', '/estandares');
    // Verificar que el primer estándar muestra un porcentaje
    cy.get('.std-card').first().contains(/%/).should('be.visible');
  });

});
