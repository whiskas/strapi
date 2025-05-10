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

export default ({ entryPath }) => {
  console.log('##### shopHmtlDocument entryPath ##### ', entryPath);
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

        <title>Shop Html Template</title>
      </head>
      <body>
        <div id="shop"></div>
        ${entryPath ? `<script type="module" src="${entryPath}"></script>` : null}
      </body>
    </html>
  `;
};
