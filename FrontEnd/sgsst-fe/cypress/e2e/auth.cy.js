// Tests E2E de autenticación
// Requiere: backend en http://localhost:3001 y frontend en http://localhost:5173

const TS = Date.now();
const TEST_EMAIL = `e2e_cypress_${TS}@sgsst.test`;
const TEST_PASSWORD = 'cypress123456';
const TEST_NOMBRE = `Cypress User ${TS}`;

describe('Flujo de autenticación — SG-SST', () => {

  it('Landing page muestra el título Guía SG-SST', () => {
    cy.visit('/');
    cy.contains('SG-SST').should('be.visible');
    cy.title().should('not.be.empty');
  });

  it('Navegar al registro desde la landing', () => {
    cy.visit('/');
    cy.contains('Registrarme gratis').click();
    cy.url().should('include', '/registro');
  });

  it('Formulario de registro tiene todos los campos', () => {
    cy.visit('/registro');
    cy.get('#reg-nombre').should('be.visible');
    cy.get('#reg-email').should('be.visible');
    cy.get('#reg-password').should('be.visible');
    cy.get('#reg-confirm').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('Registrar un nuevo usuario y redirigir a /educacion', () => {
    cy.visit('/registro');
    cy.get('#reg-nombre').type(TEST_NOMBRE);
    cy.get('#reg-email').type(TEST_EMAIL);
    cy.get('#reg-password').type(TEST_PASSWORD);
    cy.get('#reg-confirm').type(TEST_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/educacion');
  });

  it('Login con credenciales correctas redirige a /educacion', () => {
    cy.visit('/login');
    cy.get('#login-email').type(TEST_EMAIL);
    cy.get('#login-password').type(TEST_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/educacion');
  });

  it('Dashboard muestra texto de progreso SG-SST', () => {
    cy.visit('/login');
    cy.get('#login-email').type(TEST_EMAIL);
    cy.get('#login-password').type(TEST_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/educacion');
    cy.visit('/dashboard');
    // El saludo o el porcentaje de progreso deben ser visibles
    cy.contains(/Buenos|progreso|SG-SST/i).should('be.visible');
  });

  it('Credenciales incorrectas muestran mensaje de error', () => {
    cy.visit('/login');
    cy.get('#login-email').type('noexiste@test.com');
    cy.get('#login-password').type('claveincorrecta');
    cy.get('button[type="submit"]').click();
    cy.get('.alert-rojo').should('be.visible');
  });

  it('Logout vuelve al login', () => {
    cy.visit('/login');
    cy.get('#login-email').type(TEST_EMAIL);
    cy.get('#login-password').type(TEST_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/educacion');
    cy.visit('/dashboard');
    cy.contains('Salir').click();
    cy.url().should('include', '/login');
  });

});
