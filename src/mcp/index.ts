import { server } from './server';

await server.start({ transportType: 'stdio' });
