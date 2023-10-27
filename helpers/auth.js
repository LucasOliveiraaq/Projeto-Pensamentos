module.exports.checkAuth = function (req, res, next) {
    //Middleware para bloquear rotas para usuarios não autenticado.
    const userId = req.session.userid;

    if(!userId){
        res.redirect('/login');
    }

    /*
        se o usuario já estiver autenticado vai deixar seguir.
    */
    next();
}