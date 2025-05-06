// app.js
const express = require('express');
const mongoose = require('mongoose');  // Importar mongoose
const nodemailer = require('nodemailer');  // Importar NodeMailer
const app = express();

require('dotenv').config(); // Cargar las variables de entorno
const uri = process.env.MONGODB_URI;

// Conectar a MongoDB Atlas a través de Mongoose
mongoose.connect(uri)
  .then(() => console.log("Conexión exitosa a MongoDB Atlas"))
  .catch(error => console.error("Error al conectar a MongoDB Atlas:", error));

// Configurar middleware para parsear el json
app.use(express.json());
// Agregar middleware para parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));
// Servir archivos estáticos (por ejemplo el index.html) desde la carpeta "public"
app.use(express.static('public'));

/*
    Definir el esquema y modelo para los voluntarios
    (Para el registro de los voluntarios necesito: { nombre, profesion, email, disponibilidad })
 */
const volunteerSchema = new mongoose.Schema({
  nombre: String,
  profesion: String,
  email: String,
  disponibilidad: [
    {
      dia: String,
      horas: String
    }
  ],
  registeredAt: { type: Date, default: Date.now }
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

// Aqui se registraran los endpoints para cada vista
// Endpoint para registrar un voluntario
app.post('/register', async (req, res) => {
  try {
    // console.log("Datos recibidos:", req.body); // Para depuración
    const disponibilidad = JSON.parse(req.body.disponibilidad);

    const { nombre, profesion, email } = req.body;
    // Validación básica
    if (!nombre || !profesion || !email || !disponibilidad.length) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }
    // Crear y guardar un nuevo voluntario
    const newVolunteer = new Volunteer({ nombre, profesion, email, disponibilidad });
    await newVolunteer.save();
    console.log(`Registro Guardado: ${newVolunteer}`);
    // return res.status(201).json({ message: 'Registro exitoso, ¡gracias por colaborar!' });
    return res.redirect('/ThanksRegister.html');
  } catch (error) { // Aqui atrapamos el error, y lo enviamos al front
    console.error("Error registrando voluntario:", error);
    return res.status(500).json({ message: 'Error al registrar voluntario'});
  }
});

// Endpoint para consultar todos los voluntarios registrados
app.get('/volunteers', async (req, res) => {
  try {
    // Consulta todos los documentos de la colección(El registro completo de cada fila)
    const allVolunteers = await Volunteer.find({});
    // console.log("Voluntarios encontrados:", allVolunteers);
    res.json(allVolunteers);
  } catch (err) {
    console.error("Error al obtener voluntarios:", err);
    res.status(500).json({ message: 'Error al recuperar los voluntarios' + err.message });
  }
});

// Endpoint para listar todos los voluntarios registrados
app.get('/volunteer/:email', async (req, res) => {
  try {
    const voluntario = await Volunteer.findOne({ email: req.params.email });
    if (!voluntario) {
      return res.status(404).json({ message: 'Voluntario no encontrado' });
    }
    res.json(voluntario);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener datos del voluntario' });
  }
});

/* Endpoint: Solicitud de programación entre comunidad y voluntarios
 El formulario debe envíar:
    - nombre, apellido, telefono, correo, mensaje
    - voluntarioEmail (Sale del listado de voluntarios)
  Utilizaremos NodeMailer para enviar un correo al solicitante y otro al voluntario.
*/
// Configurar NodeMailer (usando Gmail como servicio)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Email desde donde salen los correos
    pass: process.env.EMAIL_PASS   // Clave del correo desde el env
  }
});
app.post('/CommunityRequest', async (req, res) => {
  const { nombre, apellido, telefono, correo, mensaje, voluntarioEmail, horariosSeleccionados } = req.body;
    // Validar que todos los datos estén presentes
    if (!nombre || !apellido || !telefono || !correo || !mensaje || !voluntarioEmail || !horariosSeleccionados) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

  // Configurar correo para el solicitante
  const mailOptionsSolicitante = {
    from: process.env.EMAIL_USER,
    to: correo,
    subject: 'Solicitud de Programación Recibida',
    text: `Hola ${nombre}, 
    Hemos recibido tu solicitud de programación con el profesional.
    Pronto nos pondremos en contacto contigo.
    
    Saludos,
    FIDIA`
  };

  // Configurar correo para el voluntario seleccionado
  const mailOptionsVoluntario = {
    from: process.env.EMAIL_USER,
    to: voluntarioEmail,
    subject: 'Nueva Solicitud de Programación',
    text: `Hola,
    Has recibido una nueva solicitud de programación.
    
    Datos del solicitante:
    Nombre: ${nombre} ${apellido}
    Teléfono: ${telefono}
    Correo: ${correo}
    Mensaje: ${mensaje}
    
    Por favor, revisa tu correo o contáctanos para coordinar la programación.
    
    Saludos,
    FIDIA`
  };
  // Vamos a intentar realizar el envio de correos
  try {
    const infoSolicitante = await transporter.sendMail(mailOptionsSolicitante);
    const infoVoluntario = await transporter.sendMail(mailOptionsVoluntario);
    
    console.log("Emails enviados:", infoSolicitante.response, infoVoluntario.response);
    // return res.status(200).json({ message: 'Solicitud enviada correctamente.' });
    return res.redirect('/ThanksRequest.html');
  } catch (err) {
    console.error("Error al enviar emails:", err);
    return res.status(500).json({ message: 'Error al enviar la solicitud.' });
  }
});

// Para pruebas locales se utiliza la siguiente función
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
