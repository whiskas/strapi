const path = require('path');
const hbs = require('../koa-hbs');

module.exports = (config, { strapi }) => {

  console.log(' ##  ##  ##  ##  middleware ## ## ## ##');
  return async function (ctx, next) {

    console.log(' ##  ##  ##  ##  middleware ## ## ## ##');

    hbs.configure({
      viewPath: path.join(__dirname, '..', 'views'),
      debug: true
    })
    const render = hbs.createRenderer();


    const html = await render('main', {title: "hello man, you rock", layout: "layout"});

    if (ctx.path === '/') {
      try {
        ctx.body = html;
      } catch (error) {
        strapi.log.error('Error rendering Handlebars page:', error);
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
