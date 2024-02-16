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
  foods: {
    [rank: number]: string;
  }[];
  voted: number[];
};

const getData = async () => JSON.parse(await Deno.readTextFile('./api/data.json')) as Data;

const router = new Router();

router
  .get('/data', async (ctx) => {
    const data = await getData();
    ctx.response.body = data;
  })
  .post('/data', async (ctx) => {
    const posted = await ctx.request.body.json() as PostData;
    const data = await getData();

    Object.keys(data).forEach(no => {
      const num = parseInt(no, 10);

      data[no][posted.member] = {
        1: posted.foods[num][1],
        2: posted.foods[num][2],
        3: posted.foods[num][3],
        voted: posted.voted[num],
      };
    });

    Deno.writeTextFile('./api/data.json', JSON.stringify(data, null, 2))
      .then(() => {
        ctx.response.body = { succeeded: true };
      })
      .catch(() => {
        ctx.response.body = { succeeded: false };
      });
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
