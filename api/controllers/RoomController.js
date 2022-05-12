/**
 * RoomController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
  
    /**
     * List all rooms with their members.
     * @param {*} _ request obj.
     * @param {*} res response obj.
     */
    find: function (_req, res) {
        Room.find().populate('members').exec((error, data) => {
            if (error) { return res.serverError(error) }
            if (!data) { return res.notFound({ message: 'Aucune donnée correspondante' }) }
            res.ok({ data })
        })
    },

    findOne: function (req, res) {
        let id = req.param('id')
        Room.findOne({ id }).populate('members').exec((error, data) => {
            if (error) { return res.serverError(error) }
            if (!data) { return res.notFound({ message: 'Aucune donnée correspondante' }) }
            res.ok({ data })
        })
    },

    /**
     * Get messages history in a given room
     * @param {*} req 
     * @param {*} res 
     */
    history: function (req, res) {
        let id = req.param('id')
        if (id.trim() == '') {
            res.badRequest({ message: 'Please make sure request parameters are correct.' })
            return
        }
        Room.findOne({ or: [{ id: id }, {refId: id}] }).populate('messages').exec((error, data) => {
            if (error) { return res.serverError(error) }
            if (!data) { return res.serverError({ message: 'Aucune donnée correspondante' }) }
            res.ok({ data: data.messages })
        })
    },

    /**
     * Join a given room
     * @param {*} req 
     * @param {*} res 
     */
    join: async function (req, res) {
        if (!req.isSocket) {
            return res.badRequest({ message: 'This must be a socket request.' })
        }
        let roomId = req.body.roomId
        let userId = req.body.userId
        if (!roomId || !userId) {
            res.badRequest({ message: 'Please make sure request parameters are correct.' })
        }
        // Ensure there is no duplicated data.
        await Room.removeFromCollection(roomId, 'members', userId)
        Room.addToCollection(roomId, 'members', userId).exec(async (error, _data) => {
            if (error) { return res.serverError(error) }
            let data = await Room.findOne({ id: roomId }).populate('members')
            //join the current socket to the room
            sails.sockets.join(req, 'room_' + roomId)
            res.ok({ data })
        })
    },

    leave: async function (req, res) {
        let roomId = req.body.roomId
        let userId = req.body.userId
        if (!roomId || !userId) {
            res.badRequest({ message: 'Please make sure request parameters are correct.' })
        }
        Room.removeFromCollection(roomId, 'members', userId).exec(async (error, _data) => {
            if (error) { return res.serverError(error) }
            let data = await Room.findOne({ id: roomId }).populate('members')
            res.ok({ data })
        })
    }
}
