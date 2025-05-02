// app.js
const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos (por ejemplo, index.html) desde la carpeta "public"
app.use(express.static('public'));

// Lista en memoria para almacenar los registros de voluntarios
const volunteers = [];

/**
 * Endpoint para registrar un voluntario.
 * Recibe: { name, profession, email, availability }
 */
app.post('/register', (req, res) => {
  const { name, profession, email, availability } = req.body;

  // Validación básica
  if (!name || !profession || !email || !availability) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  // Crear objeto voluntario
  const volunteer = {
    id: volunteers.length + 1,
    name,
    profession,
    email,
    availability,
    registeredAt: new Date()
  };

  volunteers.push(volunteer);
  console.log(`Nuevo registro: ${JSON.stringify(volunteer)}`);

  return res.status(201).json({ message: 'Registro exitoso, ¡gracias por colaborar!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Configuracion de conexion a MongoDB
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://edizonsalguero97:<db_password>@cluster0.dhohri8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Crear un MongoClient con un objeto MongoClientOptions para establecer la versión estable de la API
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Conectar el cliente al servidor (opcional a partir de v4.7)
    await client.connect();
    // Aqui se envia un ping para confirmar una conexión exitosa
    await client.db("admin").command({ ping: 1 });
    console.log("Ha hecho ping a su despliegue. ¡Se ha conectado con éxito a MongoDB");
  } finally {
    // Asegura que el cliente se cerrará cuando termine/error
    await client.close();
  }
}
run().catch(console.dir);
// Aqui finaliza la conexion de MongoDB

// Esquema para los voluntarios
const volunteerSchema = new mongoose.Schema({
  nombre: String,
  profesion: String,
  email: String,
  disponibilidad: String,
  registeredAt: { type: Date, default: Date.now }
});

// Crear el modelo a partir del esquema
const Volunteer = mongoose.model('Volunteer', volunteerSchema);

//Integracion a la Base de Datos en el Endpoin
app.post('/register', async (req, res) => {
  try {
    const { nombre, profesion, email, disponibilidad } = req.body;

    // Validación básica
    if (!nombre || !profesion || !email || !disponibilidad) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Crear una instancia del modelo Volunteer con los datos recibidos
    const newVolunteer = new Volunteer({ nombre, profesion, email, disponibilidad });

    // Guardar el nuevo voluntario en la base de datos
    await newVolunteer.save();

    console.log(`Registro Guardado: ${newVolunteer}`);
    return res.status(201).json({ message: 'Registro exitoso, ¡gracias por colaborar!' });
  } catch (error) {
    console.error("Error registrando voluntario:", error);
    return res.status(500).json({ message: 'Error al registrar voluntario' });
  }
});
