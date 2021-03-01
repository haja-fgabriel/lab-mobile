import Router from 'koa-router';
import groceries from './store';
import { broadcast } from "../utils";

export const router = new Router();

router.get('/', async (ctx) => {
  const response = ctx.response;
  const userId = ctx.state.user._id;
  response.body = await groceries.find({ userId });
  response.status = 200; // ok
});

router.get('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const body = await groceries.findOne({ _id: ctx.params.id });
  const response = ctx.response;
  if (body) {
    if (body.userId === userId) {
      response.body = body;
      response.status = 200; // ok
    } else {
      response.status = 403; // forbidden
    }
  } else {
    response.status = 404; // not found
  }
});


const createGrocery = async (ctx, body, response) => {
  try {
    const userId = ctx.state.user._id;
    body.userId = userId;
    //console.log('entity: ' + JSON.stringify(body));
    response.body = await groceries.insert(body);
    response.status = 201; // created
    //console.log(`created ${JSON.stringify(response.body)}`);
    broadcast(userId, { type: 'created', payload: response.body });
  } catch (err) {
    response.body = { message: err.message };
    response.status = 400; // bad request
  }
};

router.post('/', async ctx => await createGrocery(ctx, ctx.request.body, ctx.response));

router.put('/:id', async (ctx) => {
  const body = ctx.request.body;
  const id = ctx.params.id;
  const groceryId = body._id;
  console.log('groceryId: ' + groceryId);
  const response = ctx.response;
  if (groceryId && groceryId !== id) {
    response.body = { message: 'Param id and body _id should be the same' };
    response.status = 400; // bad request
    return;
  }
  if (!groceryId) {
    await createGrocery(ctx, body, response);
  } else {
    const userId = ctx.state.user._id;
    body.userId = userId;
    //console.log('entity: ' + JSON.stringify(body));
    const updatedCount = await groceries.update({ _id: id }, body);
    if (updatedCount === 1) {
      response.body = body;
      response.status = 200; // ok
      broadcast(userId, { type: 'updated', payload: body });
    } else {
      response.body = { message: 'Resource no longer exists' };
      response.status = 405; // method not allowed
    }
  }
});

router.del('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const body = await groceries.findOne({ _id: ctx.params.id });
  if (body && userId !== body.userId) {
    ctx.response.status = 403; // forbidden
  } else {
    await groceries.remove({ _id: ctx.params.id });
    ctx.response.status = 204; // no content
    broadcast(userId, { type: 'deleted', payload: body });
  }
});
