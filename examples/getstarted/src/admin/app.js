import { hydrate } from 'svelte';
import Hello from './hello.svelte';

if (!document.location.href.includes('admin')) {
  hydrate(Hello, {
    target: document.body,
    props: {
      name: 'Just a beautiful day'
    }
  });
}

console.log(' ### MY SRC/ADMIN/APP.JS ### ');

export default {}
