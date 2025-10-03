import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import billingsRouter from './routes/billings.js';

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/billings', billingsRouter);

app.get('/', (req, res) => res.json({ ok: true }));

export default app;
