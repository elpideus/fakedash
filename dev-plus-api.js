import 'dotenv/config';
import concurrently from 'concurrently';

const apiPort = process.env.VITE_API_PORT || 3001;
const webPort = process.env.VITE_WEB_PORT || 5173;

concurrently(
    [
        {
            command: `json-server db.json --port ${apiPort} --host 0.0.0.0`,
            name: 'API',
            prefixColor: 'cyan',
        },
        {
            command: `vite --port ${webPort} --host 0.0.0.0`,
            name: 'VITE',
            prefixColor: 'magenta',
        },
    ],
    {
        killOthersOn: ['failure', 'success'], // updated option
        restartTries: 0,
    }
);

console.log(`Starting JSON Server on port ${apiPort} and Vite on port ${webPort}...`);
