import { hydrate } from 'svelte';
import Hello from './hello.svelte';

const app = hydrate(Hello, {
  target: document.body,
  props: {
    name: 'Just a beautiful day'
  }
});

console.log(' ### MY SRC/ADMIN/APP.JS ### ');

export default {}
