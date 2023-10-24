const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('express-flash');

const app = express();

const conn = require('./db/conn');

const Tought = require('./models/Tought');
const User = require('./models/User');

//Routes
const toughtsRoutes = require('./routes/toughtsRoutes');
const authRoutes = require('./routes/authRoutes');

//Controllers
const ToughtsController = require('./controllers/ToughtController');

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

//recebe resposta do body
app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

//session middleware
app.use(session({
    name: "session", //nome do cookie
    secret: "nosso_secret", //chave secreta do cookie, evita alterações não autorizada.
    resave: false, //impede gravação automatica.
    saveUninitialized: false,
    store: new FileStore({
        logFn: function() {}, // define a log
        path: require('path').join(require('os').tmpdir(), 'sessions'), //caminho onde vai ser salvo os arquivos    
    }),
    cookie: {
        secure: false,
        maxAge: 360000, //duração do cookie
        expires: new Date(Date.now() + 360000), //expiração
        httpOnly: true
    }
}))

//flash messages 
app.use(flash());

app.use(express.static('public'));

app.use((req, res, next) => {
    if(req.session.userid){
        /*
            Manda os dados da requisição para a resposta.
        */
        res.locals.session = req.session;
    }
    next();
})

//Routes
app.use('/toughts', toughtsRoutes);
app.use('/', authRoutes);

app.get('/', ToughtsController.showToughts);

//{force: true}
conn.sync().then(() => {
    app.listen(3000)
}).catch((err) => console.log(err));