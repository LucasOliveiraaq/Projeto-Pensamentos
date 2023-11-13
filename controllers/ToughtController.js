const Tought = require('../models/Tought');
const User = require('../models/User');
const messages = require('../models/Messages');
const { Op } = require('sequelize');

module.exports = class ToughtsController {
    static async showToughts(req, res) {
        let search = '';

        if(req.query.search) {
            search = req.query.search;
        }

        let order = 'DESC';

        if(req.query.order === 'old'){
            order = 'ASC';
        } else {
            order = 'DESC';
        }

        const toughtsData = await Tought.findAll({
            include: User,
            where: {
                title: {[Op.like]: `%${search}%`},
            },
            order: [['createdAt', order]],
        });
        const toughts = toughtsData.map((result) => result.get({plain: true}));

        let contadorToughts = toughts.length;
        if(contadorToughts === 0){
            contadorToughts = false;
        }

        res.render('toughts/home', {toughts, search, contadorToughts});
    }

    static async dashboard(req, res) {
        const userId = req.session.userid
        console.log(userId);

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

        let emptyToughts = false;

        if (toughts.length === 0) {
            emptyToughts = true;
        }

        res.render('toughts/dashboard', { toughts, emptyToughts });
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

    static async removeTought(req, res) {
        const id = req.body.id;
        const userId = req.session.userid;
        try {
            await Tought.destroy({ where: { id: id, UserId: userId } })
            req.flash('message', messages.flashMessagePensamentoRemovidoComSucesso);
            req.session.save(() => {
                res.redirect('/tougths/dashboard');
            })
        } catch (err) {
            console.log(err);
        }
    }

    static async editTought(req, res) {
        const id = req.params.id;
        const tought = await Tought.findOne({ where: { id: id }, raw: true })
        res.render('toughts/edit', { tought })
    }

    static async editToughtPost(req, res) {
        const id = req.body.id;
        const tought = {
            title: req.body.title,
        };
        try {
            await Tought.update(tought, { where: { id: id } });
            req.flash('message', messages.flashMessagePensamentoAtualizadoComSucesso);
            req.session.save(() => {
                res.redirect('/tougths/dashboard');
            })
        } catch (err) {
            console.log(err);
        }
    }
}