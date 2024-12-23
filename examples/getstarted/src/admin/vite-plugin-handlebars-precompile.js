import { readFileSync } from 'fs';
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
    }
  };
}
