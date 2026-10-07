import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import db from './config/database.js';
import Activity from './models/activity.js';
import Leaderboard from './models/leaderboard.js';
import Team from './models/team.js';
import User from './models/user.js';
import Workout from './models/workout.js';

const app = express();
const port = 8000;
const codespaceName = process.env.CODESPACE_NAME;
const apiBaseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000';
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(codespaceName ? [`https://${codespaceName}-5173.app.github.dev`] : []),
]);

app.use(express.json());
app.use((request, response, next) => {
  const origin = request.get('Origin');
  const originIsAllowed = origin !== undefined && allowedOrigins.has(origin);

  if (originIsAllowed) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
  }

  if (request.method === 'OPTIONS') {
    if (!originIsAllowed) {
      response.sendStatus(403);
      return;
    }

    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.sendStatus(204);
    return;
  }

  next();
});

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: db.readyState === 1 ? 'connected' : 'disconnected',
    apiBaseUrl,
  });
});

function collectionHandler<T>(findDocuments: () => Promise<T[]>): RequestHandler {
  return async (_request, response, next) => {
    if (db.readyState !== 1) {
      response.status(503).json({ error: 'Database unavailable' });
      return;
    }

    try {
      response.json(await findDocuments());
    } catch (error) {
      next(error);
    }
  };
}

app.get('/api/users/', collectionHandler(() => User.find().lean().exec()));
app.get('/api/teams/', collectionHandler(() => Team.find().lean().exec()));
app.get('/api/activities/', collectionHandler(() => Activity.find().lean().exec()));
app.get('/api/leaderboard/', collectionHandler(() => Leaderboard.find().lean().exec()));
app.get('/api/workouts/', collectionHandler(() => Workout.find().lean().exec()));

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error('API request failed:', error);
  response.status(500).json({ error: 'Internal server error' });
};

app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
  console.log(`OctoFit API listening on port ${port} at ${apiBaseUrl}`);
});