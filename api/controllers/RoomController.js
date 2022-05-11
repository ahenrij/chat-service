/**
 * RoomController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const sailsHookAutoreload = require("sails-hook-autoreload");

module.exports = {
  
    find: function(req, res) {
        Room.find().populate('members').exec((error, data) => {
            if (error) { return res.serverError(error); }
            if (!data) { return res.notFound({ message: 'Aucune donnée correspondante' }); }
            res.ok({ data: data });
        });
    },

    history: function(req, res) {
        let id = req.param('id');
        if (id.trim() == '') {
            res.badRequest({ message: 'Please make sure request parameters are correct.' })
            return;
        }
        Room.findOne({ or: [{ id: id }, {refId: id}] }).populate('messages').exec((error, data) => {
            if (error) { return res.serverError(error); }
            if (!data) { return res.serverError({ message: 'Aucune donnée correspondante' }); }
            res.ok({ data: data.messages });
        });
    }
};

