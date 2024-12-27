import fs from 'fs';
import path from 'path';
// import { extname } from 'path';
import {getDocumentHTML, writeStaticClientFiles} from "./staticFiles";

export default async function (ctx) {

  // FIXME: SHOP_ENTRY
  const shopEntry = "./src/admin/app.js"
  await writeStaticClientFiles(ctx, shopEntry);

  // FIXME: нафига нужен этот джеки-чанк?
  const CHUNK_ID = '.strapi/client/shop.js';

  // console.log(" ##### SVELTE HANDLE SSR PLUGIN ### ")
  return {
    name: 'svelte_render_app', // Plugin name

    resolveId(...args) {
      // console.log(' ### RESOLVE ID ### ', ...args)
    },

    load(...args) {
      // console.log(' ### LOAD ### ', ...args)
    },

    // apply: "build", // если включить в девелопменте, то будет 404

    buildStart() {
      console.log(' ######## ON BUILD SSR in vite plugin svelte render #########');
      this.emitFile({
        type: 'chunk',
        id: CHUNK_ID,
        name: 'shop',
      });
    },

    generateBundle(_options, outputBundle) {
      debugger;
      console.log(' ######## ON GENERATE BUNDLE ZERO PLUGIN #########');
      const bundle = outputBundle;
      const entryFile = Object.values(bundle).find(
        (file) =>
          file.type === 'chunk' && file.name === 'shop' && file.facadeModuleId?.endsWith(CHUNK_ID)
      );

      if (!entryFile) {
        throw new Error(`Failed to find entry file in bundle (${CHUNK_ID})`);
      }

      if (entryFile.type !== 'chunk') {
        throw new Error('Entry file is not a chunk');
      }

      const entryFileName = entryFile.fileName;
      const entryPath = [ctx.basePath.replace(/\/+$/, ''), entryFileName].join('/');

      this.emitFile({
        type: 'asset',
        fileName: 'shop.html',
        source: getDocumentHTML({
          logger: ctx.logger,
          props: {
            entryPath,
          },
        }),
      });
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

      console.log(' xxx vite-plugin-svelte-render -> configure server xxx');

      // Example: Adding a custom middleware
      server.middlewares.use(async (req, res, next) => {
        console.log(' !!!!!!!!!!!! vite vite vite middleware.use(...   PATH: ', req.url);

        const isShopRequest = req.url.startsWith('/shop') || req.url === '/';

        if (!isShopRequest) return next();

        // let template = fs.readFileSync(path.join(__dirname, '..', 'custom/shop.html'), 'utf-8');
        let template = fs.readFileSync(path.relative(ctx.cwd, '.strapi/client/shop.html'), 'utf-8');
        // let template = '<html><head></head><body><h1>HAHA</h1><div id="app">no work</id></body></html>';
        template = await server.transformIndexHtml(req.url, template);
        const render = (await server.ssrLoadModule('/src/admin/entry-server.js')).default;
        const _html = await render({ template });

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
