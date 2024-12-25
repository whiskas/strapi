const path = require('path');

module.exports =  (config, { strapi }) => {

  const shopRoute = `/shop/:path*`;

  // strapi.server.router.get(shopRoute, (ctx, next)=>{
  //   console.log(" hello from shop route - controller");
  //   next();
  // });
  // // strapi.server.router.use(adminRoute, viteMiddlewares);
  // strapi.server.router.use(shopRoute, (ctx, next) => {
  //   console.log(" hello from shop route - viteMiddleware");
  //   next();
  // });

  console.log(' ##  ##  ##  ##  middleware ## ## ## ##');
  return async (ctx, next) => {

    const isShopRequest = ctx.path.startsWith('/shop') || ctx.path === '/';

    if (!isShopRequest) {
      return next();
    }

    console.log(' ##  ##  inside middleware request ## ## PATH: ', ctx.path);

    console.log("  THIS IS A SHOP REQUEST  ");

    if (ctx.path === '/') {
      try {
        // const Hello = await import('../admin/hello.svelte');
        // const { html, head, css } = render(Hello, { props: { title: "hello server svelte"}});
        // ctx.body = "hello from middleware"// html;
      } catch (error) {
        strapi.log.error('Error rendering middleware page:', error);
        ctx.status = 500;
        ctx.body = 'Internal Server Error';
      }
    } else {
      // Continue to the next middleware if the path is not "/"
      await next();
    }
    // await next();
  };

};
