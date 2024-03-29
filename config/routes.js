/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/
  'GET /room/:id/history': { controller: 'RoomController', action: 'history' },
  'POST /room/join': { controller: 'RoomController', action: 'join' },
  'POST /room/leave': { controller: 'RoomController', action: 'leave' },
  'PUT /room/typing': { controller: 'RoomController', action: 'typing' },
  'PUT /room/:id/stoppedTyping': { controller: 'RoomController', action: 'stoppedTyping' },
  'POST /message/send': { controller: 'MessageController', action: 'send' },
};
