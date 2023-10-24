const User = require('../models/User');
const bcrypt = require('bcryptjs');
const messages = require('../models/Messages');

module.exports = class AuthController {

    static login(req, res) {
        res.render('auth/login');
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
}