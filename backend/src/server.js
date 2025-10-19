import { buildApp } from './app';
import { env } from '@config';
const port = Number(env.PORT);
buildApp()
    .then((app) => app.listen({ port, host: '0.0.0.0' }))
    .then(() => console.log(`API running on http://localhost:${port}`))
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
