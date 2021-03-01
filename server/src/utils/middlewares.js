import EtagAttributes from './etagAttributes';

export const etagHandler = async (ctx, next) => {
  if (ctx.request.method === 'GET') {
    const ifModifiedSince = new Date(ctx.request.headers['if-modified-since']);
    try {
      const lastModified = EtagAttributes.lastModified();
      console.log(lastModified-ifModifiedSince);
      if (lastModified - ifModifiedSince <= 0) {
        ctx.status = 304;
      } else {
        await next();
      }
    } catch(err) {
      console.log(err);
      ctx.status=500;
    }
  } else {
    EtagAttributes.setLastModified(new Date());
    await next();
  }
}

export const exceptionHandler = async (ctx, next) => {
  try {
    return await next();
  } catch (err) {
    ctx.body = { message: err.message || 'Unexpected error.' };
    ctx.status = err.status || 500;
  }
};

export const timingLogger = async (ctx, next) => {
  const start = Date.now();
  await next();
  console.log(`${ctx.method} ${ctx.url} => ${ctx.response.status}, ${Date.now() - start}ms`);
};
