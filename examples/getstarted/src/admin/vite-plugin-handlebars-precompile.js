import { readFileSync } from 'fs';
import fs from 'node:fs/promises'
import { extname } from 'path';
import Handlebars from 'handlebars';

export default function viteHandlebarsPrecompilePlugin() {
  console.log(" ##### hbs precompile ### ")
  return {
    name: 'vite-handlebars-precompile', // Plugin name

    // Hook into Vite's module resolution process
    transform(src, id) {
      // Only process `.hbs` files
      if (extname(id) !== '.hbs') {
        return null;
      }

      console.log(' &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
      console.log(' &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
      console.log(' &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
      console.log(src, id);
      console.log(' &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
      console.log(' &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
      console.log(' &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
      // Read the Handlebars template file
      const templateContent = readFileSync(id, 'utf8');

      // Precompile the template
      const precompiled = Handlebars.precompile(templateContent);

      // Return the precompiled template as an ES module
      return {
        code: `
          import Handlebars from 'handlebars/runtime';
          export default Handlebars.template(${precompiled});
        `,
        map: null // No source map needed
      };
    },



    // The configureServer hook receives the Vite dev server instance
    configureServer(server) {
      // You can access the server instance here

      console.log(server);


      // Example: Adding a custom middleware
      server.middlewares.use( async (req, res, next) => {

        console.log(' 99999999999999', req.path, req.url);
        if (req.url.startsWith('/admin/') || req.url.startsWith('/api/')) {
          await next();
          return;
        }



        try {
          // let template = await fs.readFile(' /Users/icebear/Documents/Projects/tea/strapi/examples/getstarted/src/custom/shop.html', 'utf-8')
          let template = '<html><head></head><body></body></html>';
          template = await server.transformIndexHtml(req.url, template)
          const render = (await server.ssrLoadModule('/src/admin/entry-server.js')).default;
          const _html = render(req.url);
          console.log(' 8888888888888. ', render({template}));
        } catch (err) {
          console.log(err);
        }
        if (req.url === '/custom-endpoint') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({message: 'Hello from custom endpoint!'}));
        } else {
          next();
        }
      });

      // // Example: Listening to server events
      // server.httpServer?.on('listening', () => {
      //   const address = server.httpServer?.address();
      //   console.log(`Dev server is running on http://${address.address}:${address.port}`);
      // });
    },



  };
}
