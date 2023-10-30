const Tought = require('../models/Tought');
const User = require('../models/User');
const messages = require('../models/Messages');

module.exports = class ToughtsController {
    static async showToughts(req, res) {
        res.render('toughts/home');
    }

    static async dashboard(req, res) {        
        const userId = req.session.userid

        const user = await User.findOne({
            where: {
                id: userId,
            },
            /*
                Retorna todos os pensamentos relacionado a esse usuario.
                não precisa fazer uma nova query para buscar os pensamentos.
            */
            include: Tought, 
            plain: true,
        });
        if (!user) {
            req.flash('message', messages.flashMessageUsuario);
            res.redirect('/login');
        }
        
        /*
            Filtrando para o retorno dele ser só oque está dentro do dataValues.
        */
        const toughts = user.Toughts.map((result) => result.dataValues);
        
        res.render('toughts/dashboard', {toughts});
    }

    static createTought(req, res) {
        res.render('toughts/create')
    }

    static async createToughtSave(req, res) {
        const userId = req.session.userid;
        /*
            Uma validação a mais para não confiar só na 
            sessão do usuario autenticado.
        */
        const user = await User.findOne({
            where: {
                id: userId,
            },
        });
        if (!user) {
            req.flash('message', messages.flashMessageUsuario);
            res.redirect('/login');
        }
        const tought = {
            title: req.body.title,
            UserId: req.session.userid
        };

        try {
            await Tought.create(tought);
            req.flash('message', messages.flashMessagePensamentoCriadoComSucesso);
            req.session.save(() => {
                res.redirect('/tougths/dashboard');
            })
        } catch (err) {
            console.log(err);
        }
    }

    static async removeTought(req, res){
        const id = req.body.id;
        const userId = req.session.userid;
        try {
            await Tought.destroy({where: {id: id, UserId: userId}})
            req.flash('message', messages.flashMessagePensamentoRemovidoComSucesso);
            req.session.save(() => {
                res.redirect('/tougths/dashboard');
            })
        } catch (err) {
            console.log(err);
        }
    }
}