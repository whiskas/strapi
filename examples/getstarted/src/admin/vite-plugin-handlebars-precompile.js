import { readFileSync } from 'fs';
import fs from 'fs';
import path, { extname } from 'path';
import Handlebars from 'handlebars';

export default function viteHandlebarsPrecompilePlugin() {
  // console.log(" ##### SVELTE HANDLE SSR PLUGIN ### ")
  return {
    name: 'vite-handlebars-precompile', // Plugin name

    resolveId(...args) {
      // console.log(' ### RESOLVE ID ### ', ...args)
    },

    load(...args) {
      // console.log(' ### LOAD ### ', ...args)
    },

    // Hook into Vite's module resolution process
    // transform(src, id, options) {
    //   // console.log(' ## OPTIONS: ', options)
    //   // Only process `.hbs` files
    //   if (extname(id) !== '.hbs') {
    //     return null;
    //   }
    //
    //   console.log(' &&&&&&&&&&&&&&& TRANFORM &&&&&&&&&&&&&&&&&&');
    //   console.log('read hbs', id);
    //   console.log(' &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
    //   // Read the Handlebars template file
    //   const templateContent = readFileSync(id, 'utf8');
    //
    //   // Precompile the template
    //   const precompiled = Handlebars.precompile(templateContent);
    //
    //   // Return the precompiled template as an ES module
    //   return {
    //     code: `
    //       import Handlebars from 'handlebars/runtime';
    //       export default Handlebars.template(${precompiled});
    //     `,
    //     map: null, // No source map needed
    //   };
    // },

    // The configureServer hook receives the Vite dev server instance
    configureServer(server) {
      // You can access the server instance here

      console.log(' xxx configure server xxx');

      // Example: Adding a custom middleware
      server.middlewares.use(async (req, res, next) => {
        console.log(' !!!!!!!!!!!! vite vite vite middleware.use(...   PATH: ', req.url);

        const isShopRequest = req.url.startsWith('/shop') || req.url === '/';

        if (!isShopRequest) return next();

        let template = fs.readFileSync(path.join(__dirname, '..', 'custom/shop.html'), 'utf-8');
        // let template = '<html><head></head><body><h1>HAHA</h1><div id="app">no work</id></body></html>';
        template = await server.transformIndexHtml(req.url, template);
        const render = (await server.ssrLoadModule('/src/admin/entry-server.js')).default;
        const _html = await render({ template });
        console.log(' ssr render svelte page ', await render({ template }));
        console.log('where hes goin?');

        res.setHeader('Content-Type', 'text/html');
        res.statusCode = 200;
        res.end(_html.body);
        return;
      });

      // // Example: Listening to server events
      // server.httpServer?.on('listening', () => {
      //   const address = server.httpServer?.address();
      //   console.log(`Dev server is running on http://${address.address}:${address.port}`);
      // });
    },
  };
}
