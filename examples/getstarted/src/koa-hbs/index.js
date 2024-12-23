const fs = require('fs');
const path = require('path');
const glob = require('glob');
const util = require('util');
const globPromise = util.promisify(glob);

// Функция для объединения двух объектов
const merge = (obj1, obj2) => {
  const c = { ...obj2, ...obj1 };
  return c;
};

// Регулярное выражение для поиска шаблонов с макетами
const rLayoutPattern = /{{!<\s+([A-Za-z0-9\._\-\/]+)\s*}}/;

// Функция для чтения файла
const read = (filename) => {
  return fs.readFileSync(filename, { encoding: 'utf8' });
};

// Класс ошибки для отсутствующих шаблонов
function MissingTemplateError(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
}

util.inherits(MissingTemplateError, Error);

// Класс ошибки для неправильных опций
function BadOptionsError(message, extra) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.extra = extra;
}

util.inherits(BadOptionsError, Error);

// Экспортируем экземпляр Hbs
exports = module.exports = new Hbs();

// Функция для создания нового экземпляра Hbs
exports.create = function() {
  return new Hbs();
};

// Конструктор Hbs
function Hbs() {
  if (!(this instanceof Hbs)) return new Hbs();

  this.handlebars = require('handlebars').create();
  this.Utils = this.handlebars.Utils;
  this.SafeString = this.handlebars.SafeString;
}

// Метод для конфигурации Hbs
Hbs.prototype.configure = function(options) {
  if (!options.viewPath) throw new BadOptionsError('The option `viewPath` must be specified.');

  options = options || {};
  this.viewPath = options.viewPath;
  this.handlebars = options.handlebars || this.handlebars;
  this.templateOptions = options.templateOptions || {};
  this.extname = options.extname || '.hbs';
  this.partialsPath = options.partialsPath || [];
  this.contentHelperName = options.contentHelperName || 'contentFor';
  this.blockHelperName = options.blockHelperName || 'block';
  this.defaultLayout = options.defaultLayout || '';
  this.layoutsPath = options.layoutsPath || '';
  this.locals = options.locals || {};
  this.disableCache = options.disableCache || false;
  this.partialsRegistered = false;

  if (!Array.isArray(this.viewPath)) {
    this.viewPath = [this.viewPath];
  }

  this.cache = {};
  this.blocks = {};

  // Регистрация хелперов
  this.registerHelper(this.blockHelperName, (name, options) => {
    let val = this.block(name);
    if (val === '' && typeof options.fn === 'function') {
      val = options.fn(this);
    }
    return val;
  });

  this.registerHelper(this.contentHelperName, (name, options) => {
    return this.content(name, options, this);
  });

  return this;
};

// Метод для создания middleware
Hbs.prototype.middleware = function(options) {
  this.configure(options);
  const render = this.createRenderer();

  return async (ctx, next) => {
    ctx.render = render;
    await next();
  };
};

// Метод для создания рендерера
Hbs.prototype.createRenderer = function() {
  const hbs = this;

  return async function(tpl, locals) {
    let tplPath = hbs.getTemplatePath(tpl);
    let template, rawTemplate, layoutTemplate;

    console.log('tplPath', tplPath);

    if (!tplPath) {
      throw new MissingTemplateError('The template specified does not exist.', tplPath);
    }

    if (path.isAbsolute(tpl)) {
      tplPath = tpl + hbs.extname;
    }

    locals = merge(this.state || {}, locals || {});
    locals = merge(hbs.locals, locals);

    if (hbs.disableCache || (!hbs.partialsRegistered && hbs.partialsPath !== '')) {
      await hbs.registerPartials();
    }

    if (hbs.disableCache || !hbs.cache[tpl]) {
      rawTemplate = await read(tplPath);
      hbs.cache[tpl] = {
        template: hbs.handlebars.compile(rawTemplate)
      };

      if (typeof locals.layout !== 'undefined' || rLayoutPattern.test(rawTemplate)) {
        let layout = locals.layout;

        if (typeof layout === 'undefined') {
          layout = rLayoutPattern.exec(rawTemplate)[1];
        }

        if (layout !== false) {
          const rawLayout = await hbs.loadLayoutFile(layout);
          hbs.cache[tpl].layoutTemplate = hbs.handlebars.compile(rawLayout);
        } else {
          hbs.cache[tpl].layoutTemplate = hbs.handlebars.compile('{{{body}}}');
        }
      }
    }

    template = hbs.cache[tpl].template;
    layoutTemplate = hbs.cache[tpl].layoutTemplate;
    if (!layoutTemplate) {
      layoutTemplate = await hbs.getLayoutTemplate();
    }

    if (!hbs.templateOptions.data) {
      hbs.templateOptions.data = {};
    }

    hbs.templateOptions.data = merge(hbs.templateOptions.data, { koa: this });

    locals.body = template(locals, hbs.templateOptions);
    // this.body = layoutTemplate(locals, hbs.templateOptions);
    return layoutTemplate(locals, hbs.templateOptions);
  };
};

// Метод для получения пути к макету
Hbs.prototype.getLayoutPath = function(layout) {
  if (this.layoutsPath) {
    return path.join(this.layoutsPath, layout + this.extname);
  }
  return path.join(this.viewPath[0], layout + this.extname);
};

// Метод для получения шаблона макета
Hbs.prototype.getLayoutTemplate = async function() {
  if (this.disableCache || !this.layoutTemplate) {
    this.layoutTemplate = await this.cacheLayout();
  }
  return this.layoutTemplate;
};

// Метод для кэширования макета
Hbs.prototype.cacheLayout = async function(layout) {
  if (!layout && !this.defaultLayout) {
    return this.handlebars.compile('{{{body}}}');
  }

  if (!layout) {
    layout = this.defaultLayout;
  }

  let layoutTemplate;
  try {
    const rawLayout = await this.loadLayoutFile(layout);
    layoutTemplate = this.handlebars.compile(rawLayout);
  } catch (err) {
    console.error(err.stack);
  }

  return layoutTemplate;
};

// Метод для загрузки файла макета
Hbs.prototype.loadLayoutFile = async function(layout) {
  const file = this.getLayoutPath(layout);
  return read(file);
};

// Метод для регистрации хелпера
Hbs.prototype.registerHelper = function() {
  this.handlebars.registerHelper.apply(this.handlebars, arguments);
};

// Метод для регистрации частичного шаблона
Hbs.prototype.registerPartial = function() {
  this.handlebars.registerPartial.apply(this.handlebars, arguments);
};

// Метод для регистрации всех частичных шаблонов
Hbs.prototype.registerPartials = async function() {
  if (!Array.isArray(this.partialsPath)) {
    this.partialsPath = [this.partialsPath];
  }

  try {
    const resultList = await Promise.all(this.partialsPath.map((root) => globPromise('**/*' + this.extname, { cwd: root })));
    const files = [];
    const names = [];

    if (!resultList.length) return;

    resultList.forEach((result, i) => {
      result.forEach((file) => {
        files.push(path.join(this.partialsPath[i], file));
        names.push(file.slice(0, -1 * this.extname.length));
      });
    });

    const partials = await Promise.all(files.map(read));
    for (let i = 0; i < partials.length; i++) {
      this.registerPartial(names[i], partials[i]);
    }

    this.partialsRegistered = true;
  } catch (e) {
    console.error('Error caught while registering partials');
    console.error(e);
  }
};

// Метод для получения пути к шаблону
Hbs.prototype.getTemplatePath = function(tpl) {
  const cache = (this.pathCache || (this.pathCache = {}));
  if (cache[tpl]) return cache[tpl];

  for (let i = 0; i < this.viewPath.length; i++) {
    const viewPath = this.viewPath[i];
    const tplPath = path.join(viewPath, tpl + this.extname);
    try {
      fs.statSync(tplPath);
      if (!this.disableCache) cache[tpl] = tplPath;
      return tplPath;
    } catch (e) {
      continue;
    }
  }

  return void 0;
};

// Метод для добавления контента в блок
Hbs.prototype.content = function(name, options, context) {
  const block = this.blocks[name] || (this.blocks[name] = []);
  block.push(options.fn(context));
};

// Метод для получения контента блока
Hbs.prototype.block = function(name) {
  const val = (this.blocks[name] || []).join('\n');
  this.blocks[name] = [];
  return val;
};
