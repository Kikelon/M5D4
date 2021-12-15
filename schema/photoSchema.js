const mongoose = require('../apirest/node_modules/mongoose');

const PhotoSchema = new mongoose.Schema({
    name : { 
        type      : String, 
        required  : [ true, 'El nombre es necesario' ],
        maxlength : [ 50, 'El nombre no puede exceder los 50 caracteres'],
        minlength : [ 3, 'El nombre debe contener 3 o más caracteres'] 
    },
    url : { 
        type      : String, 
        required  : [ true, 'La URL de la imagen es necesaria' ],
        unique    : [ true, 'Esta foto ya existe. Por favor, elija otra.'],
    },
    title : String,
    description : String,
});

module.exports = mongoose.model("photos", PhotoSchema);