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
