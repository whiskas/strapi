import { getDocumentHTML, writeStaticClientFiles } from './staticFiles';

console.log(' ######## ZERO PLUGIN #########');
console.log(' ######## ZERO PLUGIN #########');
console.log(' ######## ZERO PLUGIN #########');

const buildZeroFilesPlugin = (ctx) => {
  console.log(' ######## BUILD ZERO PLUGIN #########');
  console.log(' ######## BUILD ZERO PLUGIN #########');
  console.log(' ######## BUILD ZERO PLUGIN #########');
  console.log(' ######## BUILD ZERO PLUGIN #########');

  const shopEntry = "admin/.strapi/client/shop.js"
  writeStaticClientFiles(ctx, shopEntry);

  const CHUNK_ID = '.strapi/client/shop.js';

  // eslint-disable-next-line no-debugger
  debugger;

  return {
    name: 'strapi/shop/build-files',
    apply: 'build',
    buildStart() {
      console.log(' ######## ON BUILD START ZERO PLUGIN #########');
      this.emitFile({
        type: 'chunk',
        id: CHUNK_ID,
        name: 'shop',
      });
    },
    async generateBundle(_options, outputBundle) {
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
  };
};

export { buildZeroFilesPlugin };
