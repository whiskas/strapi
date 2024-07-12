import type { Context } from 'koa';
import { getService } from '../utils';

export default {
  async createSchema(ctx: Context) {
    const { prompt, schema } = ctx.request.body as { prompt: string; schema: object | undefined };

    ctx.body = await getService('architect').create(prompt, schema);
  },
};
