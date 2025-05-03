// app.js
const express = require('express');
const mongoose = require('mongoose');  // Importar mongoose

const app = express();

// Configurar middleware para parsear el json
app.use(express.json());
// Servir archivos estáticos (por ejemplo, index.html) desde la carpeta "public"
app.use(express.static('public'));

// Conectar a MongoDB Atlas a través de Mongoose
const uri = "mongodb+srv://edizonsalguero97:Killerqueen_1@cluster0.dhohri8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri)
.then(() => console.log("Conexión exitosa a MongoDB Atlas"))
.catch((error) => console.error("Error al conectar a MongoDB Atlas:", error));

/*
    Definir el esquema y modelo para los voluntarios
    Recibe: { nombre, profesion, email, disponibilidad }
 */
const volunteerSchema = new mongoose.Schema({
  nombre: String,
  profesion: String,
  email: String,
  disponibilidad: String,
  registeredAt: { type: Date, default: Date.now }
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

// Endpoint para registrar un voluntario
app.post('/register', async (req, res) => {
  try {
    const { nombre, profesion, email, disponibilidad } = req.body;

    // Validación básica
    if (!nombre || !profesion || !email || !disponibilidad) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Crear y guardar un nuevo voluntario
    const newVolunteer = new Volunteer({ nombre, profesion, email, disponibilidad });
    await newVolunteer.save();

    console.log(`Registro Guardado: ${newVolunteer}`);
    return res.status(201).json({ message: 'Registro exitoso, ¡gracias por colaborar!' });
  } catch (error) {
    console.error("Error registrando voluntario:", error);
    return res.status(500).json({ message: 'Error al registrar voluntario' });
  }
});

// Endpoint para obtener todos los voluntarios registrados
app.get('/volunteers', async (req, res) => {
  try {
    // Consulta todos los documentos de la colección
    const allVolunteers = await Volunteer.find({});
    // console.log("Voluntarios encontrados:", allVolunteers);
    res.json(allVolunteers);
  } catch (err) {
    console.error("Error al obtener voluntarios:", err);
    res.status(500).json({ message: 'Error al recuperar los voluntarios' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
