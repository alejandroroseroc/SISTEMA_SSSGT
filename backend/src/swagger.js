const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Guía SG-SST',
      version: '1.0.0',
      description: 'API REST para el sistema de gestión de seguridad y salud en el trabajo (SG-SST). Permite gestionar empresas, estándares, progreso y reportes de cumplimiento.',
    },
    servers: [{ url: 'http://localhost:3001/api', description: 'Servidor de desarrollo' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticación y perfil de usuario' },
      { name: 'Empresa', description: 'Gestión de la empresa' },
      { name: 'Estándares', description: 'Estándares SG-SST y progreso' },
      { name: 'Reportes', description: 'Reportes de cumplimiento y ejecutivos' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
