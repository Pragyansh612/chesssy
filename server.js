const express = require('express')
const http = require('http')
const path = require('path')
const { Gameon } = require('./game')
const app = express()
const cookieParser = require("cookie-parser")
const jwt = require('jsonwebtoken')
const server = http.createServer(app)
const io = Gameon(server)
const router = express.Router()
const playerModel = require('./modules/players')
const bcrypt = require('bcrypt')

app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(router)

function loggedIn (req, res, next){
    if(!req.cookies.token) return res.redirect('/home')
    let data = jwt.verify(req.cookies.token, "Pari@2015")
    req.player = data
    next()
}

app.get('/', loggedIn, async (req, res) => {
    let player = await playerModel.findOne({email: req.player.email})
    res.render('home', { url: req.protocol + "://" + req.headers.host, player })
})
app.get('/home',(req, res) => {
    res.render('home2', { url: req.protocol + "://" + req.headers.host})
})
app.get('/register', (req, res) => {
    res.render('register', { url: req.protocol + "://" + req.headers.host })
})
app.get('/login', (req, res) => {
    res.render('login', { url: req.protocol + "://" + req.headers.host })
})
app.get('/game', loggedIn, (req, res) => {
    res.render('game', { url: req.protocol + "://" + req.headers.host })
})
app.get('/logout', loggedIn, (req, res)=>{
    res.cookie("token", "")
    res.redirect('/')
})

app.post('/register', async (req, res) => {
    let { fullname, username, email, age, password } = req.body
    let user = await playerModel.findOne({ email })
    if (user) return res.send("User already exists")
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            await playerModel.create({
                fullname,
                username,
                email,
                age,
                password: hash
            })
            let token = jwt.sign({username, email}, "Pari@2015")
            res.cookie("token", token)
            res.redirect("/")
        })
    })
})
app.post('/login', async (req, res)=>{
    let { username, email, password } = req.body
    let player = await playerModel.findOne({email: email})
    
    bcrypt.compare(password, player.password, (err, result)=>{
        if(result){
            let token = jwt.sign({username, email}, "Pari@2015")
            res.cookie("token", token)
            res.redirect("/")
        }
    })
})

server.listen(3000, () => {
    console.log("Listening on 3000")
})