const dotenv= require('dotenv')
dotenv.config();

const express = require('express');
const app = new express();

const passport = require('passport');
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const Extractjwt = passportJWT.ExtractJwt;
const bodyparser = require('body-parser');
const knex = require('knex');
const knexDb = knex({client: 'pg', connection: {host: '127.0.0.1', user:'postgres', password: 'umj76nak', database: 'jwt_password'}});
//const knexDb = knex({client: 'pg', connection: 'postgres://localhost/jwt_password'});
const bookshelf = require('bookshelf');
const securePassword = require('bookshelf-secure-password');
const db = bookshelf(knexDb);
db.plugin(securePassword);

const jwt =require('jsonwebtoken');

const PORT = process.env.PORT || 4653;

const opts ={
    jwtFromRequest: Extractjwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_OR_KEY
}; 


const User = db.Model.extend({
    tableName: 'login_user',
    hasSecurePassword: true
})


const strategy = new JwtStrategy(opts, (payload, next) => {
    // Todo: Get User. from db
     User.forge({id: payload.id}).fetch().then(res => {

        next(null, res)
    });
});

passport.use(strategy);
app.use(passport.initialize());
app.use(bodyparser.urlencoded({
    extended: false
}));
app.use(bodyparser.json())


app.listen(PORT);
// her skaber vi bruger: (kommer nok ikke i brug, da jeg er den enest bruger)
app.post('/seedUser', (req, res) =>{
    if(!req.body.email || !req.body.password) {
        return res.state(401).send('no fields');
    }

    const newuser = new User({
        id: req.body.id,
        email: req.body.email,
        password_digest: req.body.password
    })

    newuser.save().then(() => {res.send('ok')})
});

app.post('/getToken', (req, res) => {

 if(!req.body.email || !req.body.password){
     return res.status(401).send('Fields Not sent')
 }
 
 User.forge({email:req.body.email}).fetch().then(result =>{
     if(!result){
         return res.status(400).send('user not found');
     }

     console.log(User)
     result.authenticate(req.body.password).then(user =>{
        const payload = {id: user.id};
        const token = jwt.sign(payload, process.env.SECRET_OR_KEY);
        res.send(token);
 }).catch(err => {
     return res.status(401).send({err: req.body})
 });
})
})


app.get('/protected', passport.authenticate('jwt', {session: false}), (req, res) =>{
    res.send('you are logged in');
})


app.get('/',(req, res) => {
    res.send('Hallo World');
})
