const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser')
const fs = require('fs')
const multer = require('multer')

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})

// -----------SET CONFIGURATION---------------


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('./sources'))
app.set('view engine', 'ejs')
app.set('views', './sources/html');

const listOnline = []
const listOffline = loadDatabase()
var countAccount = listOffline.length;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './server/avatar-img/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

function loadDatabase() {
    var fAccount = fs.readFileSync('./server/database/userAccount.txt');
    var listAccount = JSON.parse("[" + fAccount + "]")
    return listAccount
}



// -----------------------------------------------LOGIN PROCESSION-------------------------------------------
// var accountInfo = ""

app.post('/login-request', (req, res, next) => {
    const username = req.body.username.trim()
    const password = req.body.password.trim()
    const index = listOffline.findIndex(e => e.username == username);
    if (index != -1) {
        if (listOffline[index].password == password) {
            res.send({bool:true, ID: listOffline[index].ID, name: listOffline[index].fullname})
        }
        else {
            res.send({bool:false})
        }
    }
    else {
        res.send({bool:false})
    }
})

app.get('/', (req, res, next) => {
    res.render('Main-page-interactive')
})

app.post('/username-check', (req, res, next) => {
    const reqData = req.body.data.trim();
    const bool1 = listOnline.some(e => e.username === reqData)
    const bool2 = listOffline.some(e => e.username === reqData)
    if (!bool1 && !bool2) {
        res.send(true)
    }
    else {
        res.send(false)
    }
})

app.post('/create-Account', (req, res, next) => {
    const jsonAccount = {
        username: req.body.username,
        password: req.body.password,
        fullname: req.body.fullname,
        ID: countAccount
    }
    nowCount = countAccount;
    listOffline.push(jsonAccount)
    fs.appendFileSync('./server/database/userAccount.txt', ",\n" + JSON.stringify(jsonAccount))
    countAccount++;
    res.send({ bool: true, id: nowCount })
})

app.post('/avatar-new-account', multer({ storage: storage }).single('avatar'), (req, res, next) => { res.send(true) })

app.post('/avatar-default', (req, res, next) => {
    fs.copyFileSync('./server/avatar-img/default-avatar.png', `./server/avatar-img/${req.body.id}.png`)
    res.send(true)
})
// ---------------------------------------------INTERACT PROCESSION-------------------------------------------

io.on('connection', function (socket) {
    
    socket.on('newPeerOnline', Ix => {
        const user = Ix.username;
        const index = listOffline.findIndex(e => e.username == user);
        const fname = listOffline[index].fullname;
        socket.IP = Ix.IP
        socket.account = {
            username: listOffline[index].username,
            password: listOffline[index].password,
            fullname: listOffline[index].fullname,
            ID: listOffline[index].ID
        }
        const src = fs.readFileSync(`./server/avatar-img/${listOffline[index].ID}.png`).toString('base64')
        listOffline.splice(index, 1)
        // socket
        const account = {
            ID: socket.account.ID,
            fullname: fname,
            IP: Ix.IP,
            src: src
        }
        listOnline.push(account)
        socket.emit('listOn-Off', { listOn: listOnline, listOff: listOffline })
        socket.broadcast.emit("new-online-user", account)

    })

    socket.on('getUserData', ID=>{
        socket.emit('responseUserData', socket.account.username)
    })

    socket.on('change-pass-word', Obj=>{
        socket.account.password = Obj.password;
        var TempList = loadDatabase();
        const index = TempList.findIndex(e=> e.ID == Obj.ID);
        TempList[index].password = Obj.password;
        for (var i = 0; i < TempList.length; i++){
            TempList[i] = JSON.stringify(TempList[i])
        }
        fs.writeFileSync('./server/database/userAccount.txt',TempList.join(',\n'));
    })

    socket.on('newSignOffline', Ix =>{
        const srcs = fs.readFileSync(`./server/avatar-img/${Ix.ID}.png`).toString('base64')
        const account  = {
            ID: Ix.ID,
            fullname: Ix.fname,
            src: srcs
        }
        socket.broadcast.emit('new-offline-user', account)
    })

    socket.on('get-images-buffer', list => {
        console.log("listOn-Off get:\t" + new Date().getTime() / 1000)
        const listImage = []
        list.forEach(el => {
            listImage.push(fs.readFileSync(`./server/avatar-img/${el}.png`).toString('base64'))
        });
        socket.emit("list-avatar-buffer", listImage)
    })
    socket.on('disconnect', () => {
        const index = listOnline.findIndex(e => e.IP == socket.IP);
        if (index != -1) {
            io.emit('user-out-app', { IP: socket.IP, data: socket.account })
            listOffline.push(socket.account)
            listOnline.splice(index, 1)
        }
    })
});