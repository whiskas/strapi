import { hydrate, onMount } from 'svelte';
import Hello from './App.svelte';

// Для страницы /admin* , то не рендерим Hello
if (!document.location.pathname.startsWith('/admin')) {
  // hydrate страницы
  hydrate(Hello, {
    target: document.body,
    props: {
      name: 'Just a beautiful day hhahahah',
    },
  });
}

console.log(' ### MY SRC/ADMIN/APP.JS ### ');

export default {};
