/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    find: function(req, res) {
        User.find().exec((error, data) => {
            if (error) { return res.serverError(error) }
            if (!data) { return res.notFound({ message: 'Aucune donnée correspondante' }) }
            res.ok({ data })
        })
    }
};

