import { sveltePreprocess } from 'svelte-preprocess'

export default {
  preprocess: [sveltePreprocess()],
  compilerOptions: {
    hydratable: true,
    // ssr: true,
    dev: true,
    sourcemap: true
  }
}
