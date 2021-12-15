const mongoose = require('../apirest/node_modules/mongoose');

let roles = ["Usuario", "Técnico", "Administrador", "Otro"];

const userSchema = new mongoose.Schema({
    login : {
        type : String,
        required : [true, "El login es necesario"],
        unique    : [ true, 'El login ya existe. elija. Por favor, elija otro.'],
        maxlength : [ 50, 'El nombre no puede exceder los 50 caracteres'],
        minlength : [ 3, 'El nombre debe contener 3 o más caracteres']
    },
    password : {
        type : String,
        required : [true, "La password es necesaria"],
        validate : [
            function(password){
                return password.length >= 6;
            },
            "La password tiene que tener al menos seis posiciones"
        ]
    },
    name : { 
        type      : String, 
        required  : [ true, 'El nombre es necesario' ], 
        maxlength : [ 50, 'El nombre no puede exceder los 50 caracteres'],
        minlength : [ 3, 'El nombre debe contener 3 o más caracteres'] 
    },
    surname : String,
    dateOfBirth : Date,
    comments : String,
    address : String,
    phone : String,
    email : { 
        type      : String, 
        unique    : [ true, 'El correo está duplicado'], 
        required  : [ true, 'El correo es necesario' ], 
        maxlength : [ 100, 'El correo no puede exceder los 100 caracteres'] ,
        match     : [/.+\@.+\..+/, 'Por favor ingrese un correo válido'] // <- Validación regexp para correo
    },
    rol : {
        type : String,
        required  : [ true, 'El rol es necesario' ],
        enum : roles
    },
    follow : String
});

// Middleware que recuerda los valores admitidos por el campo "rol"
userSchema.pre("save", function(next){    
    console.log("Middleware previo al salvado de \"user\"");
    console.log("Te recordamos los roles admitidos: " + roles);
    next();
});

// Middleware que recomienda el uso de passwords mayores de seis posiciones
userSchema.post("save", function(){    
    if (this.password.length === 6){
        console.log("Middleware posterior al salvado de \"user\"");
        console.log("Te recomendamos una password más larga.");
    }
});

module.exports = mongoose.model("users", userSchema);
