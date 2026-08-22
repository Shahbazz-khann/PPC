const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

const initializeSocket = (httpServer) => {
    // 12. Add CORS configuration using the existing frontend origin
    const corsOptions = {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
    };

    io = new Server(httpServer, {
        cors: corsOptions
    });

    // 5. Authenticate the Socket.IO handshake using the existing JWT mechanism
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                // 8. Reject unauthenticated or invalid-token socket connections cleanly.
                return next(new Error('Authentication error: Token is required'));
            }

            // 6. Verify the JWT using the project's existing JWT configuration
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 7. Attach values to the socket
            socket.user_id = decoded.user_id;
            socket.role = decoded.role_name;

            next();
        } catch (error) {
            logger.error('Socket authentication error:', error.message);
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    // 4. Add Socket.IO connection handling
    io.on('connection', (socket) => {
        // 9. Add temporary connection/disconnection logging
        logger.info(`User Connected - socket_id: ${socket.id}, user_id: ${socket.user_id}, role: ${socket.role}`);

        // 10. Add a simple test event
        socket.on('connection_test', () => {
            socket.emit('connection_test', {
                success: true,
                user_id: socket.user_id,
                role: socket.role
            });
        });

        // 11. Handle disconnect events cleanly
        socket.on('disconnect', (reason) => {
            logger.info(`User Disconnected - socket_id: ${socket.id}, user_id: ${socket.user_id}, role: ${socket.role}, reason: ${reason}`);
        });
        
        // 13. Modular code for future messaging (placeholders/structure)
        // socket.on('send_message', ...);
        // socket.on('typing', ...);
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIo
};
