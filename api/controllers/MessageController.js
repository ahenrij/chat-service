/**
 * MessageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const NEW_MESSAGE_EVENT = 'message';
const checkSocket = (process.env.STRICTLY_CHECK_SOCKET === 'true');

module.exports = {

  send: async function (req, res) {
    if (checkSocket && !req.isSocket) {
      return res.badRequest({ message: 'This must be a socket request.' });
    }
    const roomId = req.body.room;
    // check if room exists
    var room = await Room.findOne({ id: roomId });
    if (!room) {
      return res.badRequest({ message: 'Room not found.' });
    }
    // create message 
    Message.create(req.body).fetch().exec(async (error, data) => {
      if (error) { return res.serverError(error); }
      // get chat history
      const history = await Message.find({ room: roomId });
      // send message event with new message and history
      sails.sockets.broadcast('room_' + roomId, NEW_MESSAGE_EVENT, { data, history });
      res.ok({ data, history });
    });
  }
};

