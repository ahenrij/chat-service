/**
 * MessageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const NEW_MESSAGE_EVENT = 'message'

module.exports = {
  
    send: function (req, res) {
        let message = req.body.message
        let room = req.body.room
        let sender = req.body.sender
        let client = req.body.client
        Message.create({
            client, room, sender, message
        }).exec((error, data) => { // data is createdMessage
            if (error) { return res.serverError(error) }
            sails.sockets.broadcast('room_' + room, NEW_MESSAGE_EVENT, data)
            res.ok({ data })
        })
    }
};

