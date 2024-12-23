const globalStyles = `
  html,
  body,
  #strapi {
    height: 100%;
  }
  body {
    margin: 0;
    -webkit-font-smoothing: antialiased;
  }
`;

const ShopDocument = ({ entryPath }) => {
  console.log('##### ShopDocument entryPath ##### ', entryPath);
  return `
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="noindex" />
        <meta name="referrer" content="same-origin" />
        <style>
            ${globalStyles}
        </style>

        <title>Shop Front</title>
      </head>
      <body>
        <div id="shop" />
        ${entryPath ? `<script type="module" src="${entryPath}" />` : null}
      </body>
    </html>
  `;
};

export { ShopDocument };
