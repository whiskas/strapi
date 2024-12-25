module.exports = async () => {
  process.nextTick(() =>{
    console.log(strapi)
  })

};
// const { createServer } = require('vite');
//
// module.exports = async (...args) => {
//   console.log('   7777     args ', ...args);
//   const strapi = {};
//   if (process.env.NODE_ENV === 'development') {
//     // Initialize Vite dev server
//     const vite = await createServer({
//       root: process.cwd(), // Set the Vite root directory
//       server: {
//         middlewareMode: true, // Middleware mode
//       },
//     });
//
//     // Attach Vite to Strapi for later use in middleware
//     strapi.vite = vite;
//   }
// };
