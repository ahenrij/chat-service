/**
 * Swagger API Documentation Generator Settings.
 *
 * For all available options, see:
 * https://github.com/theoomoregbee/sails-hook-swagger-generator
 */

module.exports['swagger-generator'] = {

  disabled: false,
  
  swaggerJsonPath: './docs/swagger.json',
  
  swagger: {
    
    openapi: '3.0.0',
    
    info: {
      title: 'Chat Service Documentation',
      description: 'The API documentation for chat messaging microservice.',
      contact: { name: 'Henri Aïdasso', url: 'http://github.com/ahenrij', email: 'ahenrij@gmail.com' },
      license: { name: 'Apache 2.0', url: 'http://www.apache.org/licenses/LICENSE-2.0.html' },
      version: '0.1.0'
    },
    
    servers: [
      { url: 'http://localhost:1337/' }
    ],
    
    externalDocs: { url: 'https://ahenrij.github.io/' }
  },

  defaults: {
    
    responses: {
      '200': { description: 'The requested resource' },
      '404': { description: 'Resource not found' },
      '500': { description: 'Internal server error' }
    }
  },
  
  excludeDeprecatedPutBlueprintRoutes: true,
  
  includeRoute: function (routeInfo) { return true; },
};