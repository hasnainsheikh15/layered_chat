import express from 'express';
import cors from 'cors';
import errorHandler from './middleware/error.middleware.js';
import authRouter from './modules/auth/auth.routes.js';
import connectionRoute from './modules/connections/connections.routes.js';
import { verifyJwt } from './middleware/auth.middleware.js';
import conversationRoute from './modules/conversations/conversations.routes.js';


const app = express();

app.use(cors());
app.use(express.json());

// app.get('/', (req,res) => {
//     res.status(200).json(
//         {
//             message : "Server is running"
//         }
//     )
// })


app.get('/me', verifyJwt, (req, res) => {
  res.json({
    user: req.user,
    device: req.device
  });
});

app.use('/auth',authRouter)
app.use('/connections',connectionRoute)
app.use('/conversations',conversationRoute)

app.use(errorHandler)
export default app;
