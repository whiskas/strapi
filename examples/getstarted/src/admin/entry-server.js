import { render } from 'svelte/server'
import { default as App } from './hello.svelte'

export default async function ({ template }) {
  try {
    const html = render(App, {
      props: { title: "hello"}
    })

    return {
      body: template
        .replace('</head>', `${html.head}</head>`)
        .replace(
          '<div id="app">',
          `<div id="app">${
            html.body
          }
          `
        ),

      headers: {
        'Content-Type': 'text/html'
      },

      statusCode: 200
    }
  }
  catch (e) {
    console.error(e)

    return {
      body: import.meta.env.DEV && e instanceof Error ? e.message : '',
      statusCode: 500
    }
  }
}

function serialize(data) {
  return JSON.stringify(data).replace(/</g, '\\u003C').replace(/>/g, '\\u003E')
}
