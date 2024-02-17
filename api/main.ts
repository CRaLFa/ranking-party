import { Application, Router } from 'https://deno.land/x/oak@v13.2.5/mod.ts';
import { oakCors } from 'https://deno.land/x/cors@v1.2.2/mod.ts';

type Data = {
  [no: string]: {
    [key: string]: string | {
      [key: string]: string | number
    };
  };
};

type PostData = {
  member: string;
  items: {
    [rank: number]: string;
  }[];
  voted: number[];
};

const getData = async () => JSON.parse(await Deno.readTextFile('./api/data.json')) as Data;

const router = new Router();

router
  .get('/data', async (ctx) => {
    const data = await getData();
    console.log(data);
    ctx.response.body = Object.values(data);
  })
  .post('/data', async (ctx, next) => {
    const posted = await ctx.request.body.json() as PostData;
    console.log(posted);

    const data = await getData();
    Object.keys(data).forEach(no => {
      const idx = parseInt(no, 10) - 1;

      data[no][posted.member] = {
        1: posted.items[idx][1],
        2: posted.items[idx][2],
        3: posted.items[idx][3],
        voted: posted.voted[idx],
      };
    });
    console.log(data);

    await Deno.writeTextFile('./api/data.json', JSON.stringify(data, null, 2)).catch((e) => {
      console.error(e)
      ctx.response.body = { succeeded: false };
    });

    ctx.response.body = { succeeded: true };
    return next();
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
