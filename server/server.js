const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

let sharedGraphs = {}; // Gráficos compartidos por roomId

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('join', (roomId) => {
    socket.join(roomId);
    console.log(`Cliente ${socket.id} se unió a la sala ${roomId}`);

    // Enviar el gráfico completo al nuevo cliente
    if (sharedGraphs[roomId]) {
      socket.emit('updateGraph', sharedGraphs[roomId]);
    } else {
      sharedGraphs[roomId] = { tables: {}, relations: {} }; // Inicializar un gráfico vacío
    }
  });

  // Recibir cambios específicos del gráfico
  socket.on('graphChanged', (data) => {
    const { roomId, changeType, payload } = data; // changeType indica el tipo de cambio (newTable, updatedTable, etc.)

    switch (changeType) {
      case 'newTable':
        sharedGraphs[roomId].tables[payload.id] = payload; // Guardar la nueva tabla
        break;
      case 'updatedTable':
        sharedGraphs[roomId].tables[payload.id] = { ...sharedGraphs[roomId].tables[payload.id], ...payload }; // Actualizar tabla
        break;
      case 'newRelation':
        sharedGraphs[roomId].relations[payload.id] = payload; // Guardar la nueva relación
        break;
      case 'updatedRelation':
        sharedGraphs[roomId].relations[payload.id] = { ...sharedGraphs[roomId].relations[payload.id], ...payload }; // Actualizar relación
        break;
      // Puedes agregar otros casos según lo necesites
    }

    // Enviar el cambio a los otros clientes en la sala
    socket.to(roomId).emit('updateGraph', { changeType, payload });
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});


server.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});
