/**
 * @typedef {Object} Socket
 * @property {function(string, Function): Socket} on - Listen for an event
 * @property {function(string, any): Socket} emit - Emit an event
 */

/**
 * Handle Socket.IO connections
 * @param {import('socket.io').Server} io - The Socket.IO server instance
 */

module.exports = function(io) {
    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);
  
      const session = socket.request.session;
      console.log('Session data:', session);
  
      socket.on('myCustomEvent', (data) => {
        console.log('Received myCustomEvent with data:', data);
        
        socket.emit('responseEvent', { message: 'Hello from server!' });
      });
  
      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
      });
    });
  };