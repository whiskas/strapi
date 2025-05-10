const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const secret = 'duck-is-real-bird';
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

module.exports =  (config, { strapi }) => {

  const shopRoute = `/shop/:path*`;

  strapi.server.router.get(shopRoute, async (ctx, next)=>{
    console.log(" hello from shop route - controller");
    await next();
  });
  // strapi.server.router.use(adminRoute, viteMiddlewares);
  strapi.server.router.use(shopRoute, async (ctx, next) => {
    console.log(" hello from shop route - viteMiddleware");
    await next();
  });

  strapi.server.router.get('/web_file_editor/get_file', async (ctx) => {
    try {
      const id = ctx.query.id;
      if (!id) {
        ctx.status = 400;
        ctx.body = 'ID query parameter is required';
        return;
      }

      const relativeFilePath = decrypt(id);
      const customDir = path.join(__dirname, '../custom');
      const filePath = path.resolve(customDir, relativeFilePath);

      if (!filePath.startsWith(customDir)) {
        ctx.status = 403;
        ctx.body = 'Access to the specified path is forbidden';
        return;
      }

      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        ctx.status = 404;
        ctx.body = 'File not found';
        return;
      }

      const fileInfo = getFileInfo(filePath, customDir, true);
      ctx.body = fileInfo;
    } catch (error) {
      strapi.log.error('Error reading file:', error);
      ctx.status = 500;
      ctx.body = 'Internal Server Error';
    }
  });

  strapi.server.router.get('/web_file_editor/get_directory', async (ctx) => {
    try {
      const directoryPath = path.join(__dirname, '../custom');
      const directoryStructure = getDirectoryStructure(directoryPath);
      ctx.body = directoryStructure;
    } catch (error) {
      strapi.log.error('Error reading directory:', error);
      ctx.status = 500;
      ctx.body = 'Internal Server Error';
    }
  });

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
  };

};


// возвращаем структуру папок из директории
const getFileInfo = (filePath, baseDir, includeContent = false, currentDepth = 1) => {
  const stats = fs.statSync(filePath);
  const relativePath = path.relative(baseDir, filePath);
  const id = encrypt(relativePath);

  const parentDir = path.dirname(relativePath);
  const parentId = parentDir === '.' ? null : encrypt(parentDir);

  const fileInfo = {
    id,
    parentId,
    depth: currentDepth,
    name: path.basename(filePath),
    type: stats.isDirectory() ? 1 : 0,
    path: relativePath,
    lastModified: stats.mtime.toISOString(),
    created: stats.birthtime.toISOString(),
    size: stats.size,
    readable: fs.accessSync(filePath, fs.constants.R_OK) === undefined,
    writable: fs.accessSync(filePath, fs.constants.W_OK) === undefined,
    content: includeContent && stats.isFile() ? fs.readFileSync(filePath, 'utf-8') : null,
  };

  if (!stats.isDirectory()) {
    fileInfo.extension = path.extname(filePath).slice(1);
  }

  return fileInfo;
};


const getDirectoryStructure = (dirPath, baseDir = dirPath, currentDepth = 0) => {
  const result = {
    dirs: [],
    files: [],
    depth: currentDepth,
    // name: 'root',
    type: 1,
    id: "0",
    parentId: null
  };
  const items = fs.readdirSync(dirPath);

  items.forEach((item) => {
    const fullPath = path.join(dirPath, item);
    let fileInfo = getFileInfo(fullPath, baseDir, true, currentDepth + 1);

    if (fileInfo.type === 1) {
      const _fileInfo = getDirectoryStructure(fullPath, baseDir, currentDepth + 1);
      fileInfo = { ...fileInfo, ..._fileInfo };
      result.dirs.push(fileInfo);
    } else {
      result.files.push(fileInfo);
    }
  });

  return result; //{ dirs: result.dirs, files: result.files };
};


const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, crypto.scryptSync(secret, 'salt', 32), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  const [ivHex, encrypted] = text.split(':');
  const decipher = crypto.createDecipheriv(algorithm, crypto.scryptSync(secret, 'salt', 32), Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
