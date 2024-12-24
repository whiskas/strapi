const path = require('path');
const hbs = require('../koa-hbs');
// const server  = import('svelte/server');
// import { render} from 'svelte/server';


module.exports = (config, { strapi }) => {

  console.log(' ##  ##  ##  ##  middleware ## ## ## ##');
  return async function (ctx, next) {

    // const { render } = await import('svelte/server');

    console.log(' ##  ##  ##  ##  inside middleware request ## ## ## ##');

    hbs.configure({
      viewPath: path.join(__dirname, '..', 'views'),
      debug: true
    })
    const render = hbs.createRenderer();

    const html = await render('main', {title: "hello man, you rock", layout: "layout"});

    if (ctx.path.startsWith('/admin/') || ctx.path.startsWith('/api/')) {
      await next();
      return;
    }

    if (ctx.path === '/') {
      try {
        // const Hello = await import('../admin/hello.svelte');
        // const { html, head, css } = render(Hello, { props: { title: "hello server svelte"}});
        ctx.body = html;
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
