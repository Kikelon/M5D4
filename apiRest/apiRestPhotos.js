
let express = require('express');
let app = express();
let cors = require('cors')
let mongoose = require('mongoose');
let User = require('../schema/userSchema')
const Photo = require('../schema/photoSchema');

const apiPort = 3000;
const UserSchema = new User;
const PhotoSchema = new Photo;

// let UserModel = mongoose.model('User', UserSchema, 'user');                
// let PhotoModel = mongoose.model('User', PhotoSchema, 'user'); 

const mongoDB = 'mongodb://localhost:27017/photos';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
.then(console.log('Conexión establecida con éxito'))
.catch((error) => console.log(error)); 

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());



// GET/photos - Dado un usuario, obtiene todas sus fotos
app.get('/photos', function (req, res) {
    if (req.query.name == null) {
        let message = 'Error. No se han proporcionado los datos necesarios. Falta el usuario.';
        console.log(message);
        res.send(message);
    }
    else {
        Photo.find({ name: req.query.name })
            .then((photo) => {
                console.log(photo);
                if (photo.length == 0) { res.status(404).send(photo) } else { res.send(photo) };
            })
            .catch((err) => {
                console.log(err);
                res.status(422).send(err.message);
            })
    };
});        

// POST/photos -  Dado un usuario, url de foto, título y descripción, guardarlo en la colección
app.post('/photos', function (req, res) {
    if ((req.query.name == null) || (req.query.url == null)) {
        let message = 'Error. No se han proporcionado los datos necesarios.';
        (req.query.name == null) ? message = message + ' Falta el usuario.' : false;
        (req.query.url == null) ? message = message + ' Falta la url.' : false;
        console.log(message);
        res.send(message);
    }
    else {
        console.log('POST/photos - Añadimos un nuevo documento')
        Photo.create(req.query)
            .then((photo) => {
                console.log(photo);
                if (photo.length == 0) { res.status(404).send(photo) } else { res.send(photo) };
            })
            .catch((err) => {
                console.log(err);
                res.status(422).send(err.message);
            });
    }
});       


// DEL/photos -  Dado un usuario y un título de foto, eliminar dicha foto
// DEL/photos -  Dado un usuario eliminar todas sus fotos
app.delete('/photos', function (req, res) {
    if ((req.body.name == null) || (req.body.title == null)) {
        let message = 'Error. No se han proporcionado los datos necesarios.';
        (req.body.name == null) ? message = message + ' Falta el usuario.' : false;
        (req.body.title == null) ? message = message + ' Falta el título.' : false;
        console.log(message);
        res.send(message);
    }
    else if (req.body.titulo == null) {
        console.log('DEL/photos - Borramos todas las fotos del usuario: ' + req.body.id);
        Photo.deleteMany({ name: req.body.name })
            .then((res) => {
                console.log(res);
                res.send(res);
            })
            .catch((err) => {
                console.log(err);
                res.status(422).send(err.message);
            });
    }
    else {
        console.log('DEL/photos - Borramos las fotos del usuario ' + req.body.id + ' con el título ' + req.body.titulo);
        Photo.deleteMany({ name: req.body.name, title: req.body.title })
            .then((res) => {
                console.log(res);
                res.send(res);
            })
            .catch((err) => {
                console.log(err);
                res.status(422).send(err.message);
            });
    }
});

// PUT/follow -  Dado un usuario origen y uno destino, hacer que el usuario origen siga al usuario destino
app.put('/follow', function (req, res) {
    if ((req.query.followerId == null) || (req.query.followedId == null)) {
        console.log('Error. No se han proporcionado usuarios');
        (req.query.followerId == null) ? message = message + ' Falta el usuario que va a seguir a alguien.' : false;
        (req.query.followedId == null) ? message = message + ' Falta el usuario a seguir.' : false;
        console.log(message);
        res.send(message);
    }
    else {
        console.log('PUT/follow - el usuario ' + req.query.followerId + ' siga al usuario ' + req.query.followedId);
        User.updateOne({ name: req.query.followerId }, { follow: req.body.title })
            .then((res) => {
                if (res.upsertedCount == 1) {
                    console.log(res);
                    res.send(res);
                }
                else {
                    console.log('No se actualizó la información del usuario  \"' + req.query.followerId + '\"');
                };
            })
            .catch((err) => {
                console.log(err);
                res.status(422).send(err.message);
            });
    }
}); 

// PUT/unfollow -  Dado un usuario origen y uno destino, hacer que el usuario origen deje de seguir al usuario destino. 
//                 Si el destino no coincide con el seguido por el usuario, no hacer nada.
app.put('/unfollow', function (req, res) {
    if ((req.query.followerId == null) || (req.query.followedId == null)) {
        console.log('Error. No se han proporcionado usuarios');
        (req.query.followerId == null) ? message = message + ' Falta el usuario que sigue a alguien.' : false;
        (req.query.followedId == null) ? message = message + ' Falta el usuario seguido.' : false;
        console.log(message);
        res.send(message);
    }
    else {
        console.log('PUT/unfollow - el usuario ' + req.query.followerId + ' dejará de seguir al usuario ' + req.query.followedId);
        User.updateOne({ name: req.query.followerId, follow: req.body.title }, { follow: null })
            .then((res) => {
                if (res.upsertedCount == 1) {
                    console.log(res);
                    res.send(res);
                }
                else {
                    console.log('No se actualizó la información del usuario  \"' + req.query.followerId + '\"');
                };
            })
            .catch((err) => {
                console.log(err);
                res.status(422).send(err.message);
            });
    }
}); 

// GET/timeline - Dado un usuario, obtener su timeline (mostrar todas las fotos de la persona seguida)
app.get('/timeline', function (req, res) {
    if (req.query.name == null) {
        let message = 'Error. No se han proporcionado los datos necesarios. Falta el usuario.';
        console.log(message);
        res.send(message);
    }
    else {
        Photo.findOne({ name: req.query.name })
            .then((user) => {
                if ((user.follow == null) || (user.follow == "")) {
                    let message = 'Error. El usuario \"' + req.query.name + '\" no sigue a nadie.';
                    console.log(message);
                    res.send(message);
                }
                else {
                    Photo.find({ name: user.follow })
                        .then((photo) => {
                            console.log(photo);
                            res.send(photo)
                        })
                };
            })
            .catch((err) => {
                console.log(err);
                res.status(422).send(err.message);
            })
    }
}); 

app.listen(apiPort, function() {
    console.log('Escuchando en el puerto: ' + apiPort)
});
