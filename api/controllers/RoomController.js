/**
 * RoomController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
require('dotenv').config();

const TYPING_EVENT = 'typing';
const STOPPED_TYPING_EVENT = 'stoppedTyping';
const checkSocket = (process.env.STRICTLY_CHECK_SOCKET === 'true');

module.exports = {

  /**
     * List all rooms with their members.
     * @param {*} _ request obj.
     * @param {*} res response obj.
     */
  find: function (_req, res) {
    Room.find().exec((error, data) => {
      if (error) { return res.serverError(error); }
      if (!data) { return res.notFound(); }
      return res.ok({ data });
    });
  },

  findOne: function (req, res) {
    let id = req.param('id');
    Room.findOne({ or: [{ id }, { refId: id }] }).exec((error, data) => {
      if (error) { return res.serverError(error); }
      if (!data) { return res.notFound(); }
      return res.ok({ data });
    });
  },

  /**
     * Get messages history in a given room
     * @param {*} req
     * @param {*} res
     */
  history: function (req, res) {
    let id = req.param('id');
    if (id.trim() === '') {
      return res.badRequest({ message: 'Please make sure request parameters are correct.' });
    }
    Room.findOne({ or: [{ id: id }, {refId: id}] }).populate('messages').exec((error, data) => {
      if (error) { return res.negotiate(error); }
      if (!data) { return res.notFound(); }
      return res.ok({ data: data.messages });
    });
  },

  /**
     * Join a given room
     * @param {*} req
     * @param {*} res
     */
  join: function (req, res) {
    if (checkSocket && !req.isSocket) {
      return res.badRequest({ message: 'This must be a socket request.' });
    }
    let roomId = req.body.roomId;
    let user = req.body.user; // User's json representation with mandatory id field
    if (!roomId || !user || !user.id) {
      return res.badRequest({ message: 'Please make sure request parameters are correct.' });
    }
    Room.findOne({ or: [{id: roomId}, {refId: roomId}] }).exec(async (error, foundRoom) => {
      if (error) { return res.serverError(error); }
      if (!foundRoom) { return res.notFound(); }

      // Add user to members and ensure it is unique
      _.remove(foundRoom.members, m => m.id === user.id);
      foundRoom.members.push(user);
      const members = foundRoom.members;

      // Save update and notify
      let updatedRoom = await Room.updateOne({ id: foundRoom.id }).set({ members });
      sails.sockets.join(req, 'room_' + roomId);
      return res.ok({ data: updatedRoom });
    });
  },

  leave: async function (req, res) {
    if (checkSocket && !req.isSocket) {
      return res.badRequest({ message: 'This must be a socket request.' });
    }
    let roomId = req.body.roomId;
    let user = req.body.user; // User's json representation with mandatory id field
    if (!roomId || !user || !user.id) {
      return res.badRequest({ message: 'Please make sure request parameters are correct.' });
    }
    Room.findOne({ or: [{id: roomId}, {refId: roomId}] }).exec(async (error, foundRoom) => {
      if (error) { return res.negotiate(error); }
      if (!foundRoom) { return res.notFound(); }

      // Remove the user
      _.remove(foundRoom.members, m => m.id === user.id);
      const members = foundRoom.members;

      // Save update and notify
      let updatedRoom = await Room.updateOne({ id: foundRoom.id }).set({ members });
      sails.sockets.leave(req, 'room_' + roomId);
      return res.ok({ data: updatedRoom });
    });
  },

  typing: function (req, res) {
    if (checkSocket && !req.isSocket) {
      return res.badRequest({ message: 'This must be a socket request.' });
    }
    let user = req.body.user; // user that is typing's id and name
    let roomId = req.body.roomId;
    if (!roomId || !user || !user.id || !user.name) {
      return res.badRequest({ message: 'Please make sure request parameters are correct.' });
    }
    // TODO: Check if room exists
    // Send typing event except user itself.
    sails.sockets.broadcast('room_' + roomId, TYPING_EVENT, req.body, (req.isSocket ? req : undefined));
    return res.ok();
  },

  stoppedTyping: function (req, res) {
    if (checkSocket && !req.isSocket) {
      return res.badRequest({ message: 'This must be a socket request.' });
    }
    let roomId = req.param('id');
    if (!roomId) {
      return res.badRequest({ message: 'Please make sure request parameters are correct.' });
    }
    // TODO: Check if room exists
    sails.sockets.broadcast('room_' + roomId, STOPPED_TYPING_EVENT, roomId, (req.isSocket ? req : undefined));
    return res.ok();
  }
};
