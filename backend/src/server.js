import dotenv from 'dotenv';
import app from './app.js';
import prisma from './config/prisma.js';
import http from 'http';
import { initSocket } from './websocket/socket.js';


dotenv.config();

const port = process.env.PORT || 5000

const server = http.createServer(app);

initSocket(server)

async function startServer() {
    try {
        await prisma.$connect();
        console.log('Connected to the database');

        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        })

    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}

startServer();

