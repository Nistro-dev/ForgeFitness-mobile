import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function mailRoutes(app: FastifyInstance) {
  app.post('/test', async (req, reply) => {
    const body = z
      .object({
        to: z.string().email(),
        subject: z.string().min(1),
        html: z.string().min(1),
        text: z.string().optional(),
      })
      .parse(req.body);

    const mailer = app.diContainer.resolve(
      'mailer'
    ) as import('../../../../domain/ports/Mailer').Mailer;

    await mailer.send({
      to: { email: body.to },
      subject: body.subject,
      html: body.html,
      text: body.text,
    });

    return reply.code(204).send();
  });
}

