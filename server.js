import express from 'express';
import cors from 'cors';
import router from './src/routes.js';

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173', // Vite dev local
  'https://starter-project-express-ai-frontend.vercel.app/', // Preview URL Vercel
  'https://starter-project-express-ai-git-64bf51-msyafiulmasruris-projects.vercel.app', // URL Vercel kamu
  'https://starter-project-express-ai-frontend-o47fh28mn.vercel.app', // Preview URL Vercel
];

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use('/', router);

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
