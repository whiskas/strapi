import path from 'node:path';
import { glob } from 'glob';

export default async function () {
  const files = await glob('./packages/**/rollup.config.mjs', {
    ignore: ['**/node_modules/**'],
  });

  const config = await Promise.all(
    files.map((file) => {
      console.log(file);

      return import(path.resolve(import.meta.dirname, file)).then(({ default: config }) => {
        return config;
      });
    })
  );

  console.log(config);

  return (await config).reduce((acc, c) => {
    return acc.concat(c);
  }, []);
}
