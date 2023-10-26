const User = require('../models/User');
const bcrypt = require('bcryptjs');
const messages = require('../models/Messages');

module.exports = class AuthController {

    static login(req, res) {
        res.render('auth/login');
    }

    static async loginPost(req, res) {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            req.flash('message', messages.flashMessageUsuario);
            res.render('auth/login');
            return
        }

        const passwordMath = bcrypt.compareSync(password, user.password); //chegou aqui porque user já existe.
        if (!passwordMath) {
            req.flash('message', messages.flashMessageSenhaInvalida);
            res.render('auth/login');
            return
        }

        req.session.userid = user.id;

        req.flash('message', messages.flashMessageAutenticacao);

        req.session.save(() => {
            res.redirect('/');
        })
    }

    static register(req, res) {
        res.render('auth/register');
    }

    static async registerPost(req, res) {
        const { name, email, password, confirmpassword } = req.body;

        if (password != confirmpassword) {
            req.flash('message', messages.flashMessageSenha);
            res.render('auth/register');
            return
        }

        //check if user exists
        const checkIfUserExists = await User.findOne({ where: { email: email } });
        if (checkIfUserExists) {
            req.flash('message', messages.flashMessageEmail);
            res.render('auth/register');
            return;
        }

        //create a password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const user = {
            name,
            email,
            password: hashedPassword
        };

        try {
            const createdUser = await User.create(user);

            //initialize session
            req.session.userid = createdUser.id;

            req.flash('message', messages.cadastro);

            req.session.save(() => {
                res.redirect('/');
            })
        } catch (err) {
            console.log(err);
        }
    }

    static logout(req, res) {
        req.session.destroy(); //removendo a sessão do sistema.
        res.redirect('/login');
    }
}