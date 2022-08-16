/**
 * MessageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const NEW_MESSAGE_EVENT = 'message';

module.exports = {

  send: function (req, res) {
    let roomId = req.body.room;
    Message.create(req.body).exec((error, data) => { // data is createdMessage
      if (error) { return res.serverError(error); }
      sails.sockets.broadcast('room_' + roomId, NEW_MESSAGE_EVENT, data);
      res.ok({ data });
    });
  }
};

