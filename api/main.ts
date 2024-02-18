import { Application, Router } from 'https://deno.land/x/oak@v13.2.5/mod.ts';
import { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts';

type Data = {
  [key: string]: string | {
    [key: string]: string | number;
  };
}[];

type PostData = {
  member: string;
  items: {
    [rank: number]: string;
  }[];
  voted: number[];
};

const KV_KEY = ['rankingParty', 20240223];

(async () => {

  const router = new Router();
  const kv = await Deno.openKv();

  router
    .get('/data', async (ctx) => {
      let data: string;
      // await kv.delete(KV_KEY);
      const value = (await kv.get(KV_KEY)).value;
      if (value === null) {
        data = await Deno.readTextFile('./api/template.json');
        await kv.set(KV_KEY, data);
      } else {
        data = value as string;
      }
      ctx.response.body = JSON.parse(data);
    })
    .post('/data', async (ctx) => {
      const posted = await ctx.request.body.json() as PostData;
      console.log(posted);
      const value = (await kv.get(KV_KEY)).value;
      if (value === null) {
        ctx.response.body = { succeeded: false };
        return;
      }
      const data = JSON.parse(value as string) as Data;
      data.forEach((_, idx) => {
        data[idx][posted.member] = {
          1: posted.items[idx][1],
          2: posted.items[idx][2],
          3: posted.items[idx][3],
          voted: posted.voted[idx],
        };
      });
      const result = await kv.set(KV_KEY, JSON.stringify(data));
      ctx.response.body = { succeeded: result.ok };
    });

  const app = new Application();
  app.use(oakCors()); // Enable CORS for All Routes
  app.use(router.routes());
  app.use(router.allowedMethods());

  await app.listen({ port: 8000 });

})();
