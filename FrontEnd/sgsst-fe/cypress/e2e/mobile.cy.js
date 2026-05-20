// Tests E2E en viewport mobile (iPhone 14)
// Requiere: backend en http://localhost:3001 y frontend en http://localhost:5173

const TS = Date.now();
const TEST_EMAIL = `e2e_mob_${TS}@sgsst.test`;
const TEST_PASSWORD = 'cypress123456';
const TEST_NOMBRE = `Mobile User ${TS}`;

describe('Pruebas en viewport mobile — 390x844 (iPhone 14)', () => {

  beforeEach(() => {
    cy.viewport(390, 844);
  });

  it('Landing es visible y usable en 390px', () => {
    cy.visit('/');
    cy.contains('SG-SST').should('be.visible');
    cy.contains('Registrarme gratis').should('be.visible');
  });

  it('El formulario de registro es usable en mobile', () => {
    cy.visit('/registro');
    cy.get('#reg-nombre').should('be.visible').type(TEST_NOMBRE);
    cy.get('#reg-email').should('be.visible').type(TEST_EMAIL);
    cy.get('#reg-password').should('be.visible').type(TEST_PASSWORD);
    cy.get('#reg-confirm').should('be.visible').type(TEST_PASSWORD);
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('El formulario de login es usable en mobile', () => {
    cy.visit('/login');
    cy.get('#login-email').should('be.visible');
    cy.get('#login-password').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('El menú hamburguesa existe y funciona después del login', () => {
    // Registrar usuario para el test
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/register',
      body: { nombre: TEST_NOMBRE, email: TEST_EMAIL, password: TEST_PASSWORD },
      failOnStatusCode: false,
    });

    cy.visit('/login');
    cy.get('#login-email').type(TEST_EMAIL);
    cy.get('#login-password').type(TEST_PASSWORD);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/educacion');
    cy.visit('/dashboard');

    // En mobile el hamburger debe ser visible
    cy.get('[data-cy="hamburger"]').should('be.visible');

    // Al hacer clic, el menú mobile debe aparecer
    cy.get('[data-cy="hamburger"]').click();
    cy.get('#mobile-menu').should('be.visible');

    // Al hacer clic en un link, el menú debe cerrarse
    cy.get('#mobile-menu').contains('Estándares').click();
    cy.url().should('include', '/estandares');
    cy.get('#mobile-menu').should('not.exist');
  });

  it('El Navbar desktop está oculto y el hamburger visible en mobile (página autenticada)', () => {
    // El Navbar solo existe en páginas protegidas (LayoutAuth)
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/register',
      body: { nombre: `Mob2 ${TS}`, email: `mob2_${TS}@sgsst.test`, password: TEST_PASSWORD },
      failOnStatusCode: false,
    }).then((res) => {
      if (res.body.token) {
        window.localStorage.setItem('sgsst_token', res.body.token);
        window.localStorage.setItem('sgsst_user', JSON.stringify(res.body.user));
      }
    });

    cy.visit('/dashboard');
    // En mobile el nav desktop debe estar oculto y el hamburger visible
    cy.get('.topnav-desktop').should('not.be.visible');
    cy.get('.topnav-hamburger').should('be.visible');
  });

});
