// Comandos globales de Cypress para SG-SST

// Comando personalizado para login rápido via API
Cypress.Commands.add('loginApi', (email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3001/api/auth/login',
    body: { email, password },
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 200) {
      window.localStorage.setItem('sgsst_token', res.body.token);
      window.localStorage.setItem('sgsst_user', JSON.stringify(res.body.user));
    }
  });
});

// Comando para registro y login via API
Cypress.Commands.add('registerAndLogin', (nombre, email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3001/api/auth/register',
    body: { nombre, email, password },
    failOnStatusCode: false,
  }).then((res) => {
    const token = res.body.token;
    const user = res.body.user;
    if (token) {
      window.localStorage.setItem('sgsst_token', token);
      window.localStorage.setItem('sgsst_user', JSON.stringify(user));
    }
  });
});
