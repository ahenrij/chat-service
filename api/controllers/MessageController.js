/**
 * MessageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const NEW_MESSAGE_EVENT = 'message';
const checkSocket = (process.env.STRICTLY_CHECK_SOCKET === 'true');

module.exports = {

  send: function (req, res) {
    if (checkSocket && !req.isSocket) {
      return res.badRequest({ message: 'This must be a socket request.' });
    }
    let roomId = req.body.room;
    Message.create(req.body).exec((error, data) => { // data is createdMessage
      if (error) { return res.serverError(error); }
      sails.sockets.broadcast('room_' + roomId, NEW_MESSAGE_EVENT, data);
      res.ok({ data });
    });
  }
};

