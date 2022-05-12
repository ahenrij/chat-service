/**
 * RoomController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
 require('dotenv').config()

const TYPING_EVENT = 'typing'
const STOPPED_TYPING_EVENT = 'stoppedTyping'
const checkSocket = (process.env.STRICTLY_CHECK_SOCKET === 'true')

module.exports = {
  
    /**
     * List all rooms with their members.
     * @param {*} _ request obj.
     * @param {*} res response obj.
     */
    find: function (_req, res) {
        Room.find().exec((error, data) => {
            if (error) { return res.serverError(error) }
            if (!data) { return res.notFound({ message: 'Aucune donnée correspondante.' }) }
            res.ok({ data })
        })
    },

    findOne: function (req, res) {
        let id = req.param('id')
        Room.findOne({ or: [{ id }, { refId: id }] }).exec((error, data) => {
            if (error) { return res.serverError(error) }
            if (!data) { return res.notFound({ message: 'Aucune donnée correspondante.' }) }
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
            if (error) { return res.negotiate(error) }
            if (!data) { return res.notFound({ message: 'Aucune donnée correspondante.' }) }
            res.ok({ data: data.messages })
        })
    },

    /**
     * Join a given room
     * @param {*} req 
     * @param {*} res 
     */
    join: function (req, res) {
        if (checkSocket && !req.isSocket) {
            return res.badRequest({ message: 'This must be a socket request.' })
        }
        let roomId = req.body.roomId
        let userId = req.body.userId
        if (!roomId || !userId) {
            res.badRequest({ message: 'Please make sure request parameters are correct.' })
        }
        Room.findOne({ or: [{id: roomId}, {refId: roomId}] }).exec(async (error, foundRoom) => {
            if (error) { return res.serverError(error) }
            if (!foundRoom) { return res.notFound({ message: 'Aucune donnée correspondante.' }) }
            // Add user(s) to members
            if (Array.isArray(userId)) {
                foundRoom.members.push.apply(foundRoom.members, userId)
            } else {
                foundRoom.members.push(userId)
            }
            let members = _.uniq(foundRoom.members)
            // save update
            let updatedRoom = await Room.update({ id: foundRoom.id }).set( { members } ).fetch()
            sails.sockets.join(req, 'room_' + roomId)
            res.ok({ data: updatedRoom })
        })
    },

    leave: async function (req, res) {
        if (checkSocket && !req.isSocket) {
            return res.badRequest({ message: 'This must be a socket request.' })
        }
        let roomId = req.body.roomId
        let userId = req.body.userId
        if (!roomId || !userId) {
            res.badRequest({ message: 'Please make sure request parameters are correct.' })
        }
        Room.findOne({ or: [{id: roomId}, {refId: roomId}] }).exec(async (error, foundRoom) => {
            if (error) { return res.negotiate(error) }
            if (!foundRoom) { return res.notFound({ message: 'Aucune donnée correspondante.' }) }
            _.remove(foundRoom.members, m => m == userId)
            let members = foundRoom.members
            // save update
            let updatedRoom = await Room.update({ id: foundRoom.id }).set({ members }).fetch()
            sails.sockets.leave(req, 'room_' + roomId)
            res.ok({ data: updatedRoom })
        })
    },

    typing: function (req, res) {
        if (checkSocket && !req.isSocket) {
            return res.badRequest({ message: 'This must be a socket request.' })
        }
        let user = req.body.user // user that is typing's id and name
        let roomId = req.body.roomId
        if (!roomId || !user.id || !user.name) {
            res.badRequest({ message: 'Please make sure request parameters are correct.' })
        }
        // TODO: Check if room exists
        // send typing event except user itself.
        sails.broadcast('room_' + roomId, TYPING_EVENT, user, (req.isSocket ? req : undefined))
        return res.ok()
    },

    stoppedTyping: function (req, res) {
        if (!req.isSocket) {
            return res.badRequest({ message: 'This must be a socket request.' })
        }
        let roomId = req.body.roomId
        if (!roomId) {
            res.badRequest({ message: 'Please make sure request parameters are correct.' })
        }
        // TODO: Check if room exists
        sails.broadcast('room_' + roomId, STOPPED_TYPING_EVENT, (req.isSocket ? req : undefined))
        return res.ok()
    }
}
