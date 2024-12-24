import Handlebars from 'handlebars';
// import t from '../views/templates/t';
import { hydrate } from 'svelte';
import mainTemplate from '../../src/views/main.hbs'
import Main from './hello.svelte';
// Step 2: Create an inline string with a Handlebars template

// Step 3: Define a variable with the data to be used in the template
const data = {
  title: 'roma kabiev is fukn greate',
  message: 'This is a Handlebars template example.'
};

console.log(Main);

const app = hydrate(Main, {
  // target: document.getElementById('shop'),
  target: document.body,
  props: {
    name: 'world'
  }
});

// Step 4: Compile the template with the variable
// const template = Handlebars.compile(templateString);
const html = mainTemplate(data);
// const html = "hello dude";
// Step 5: Log the resulting HTML
console.log(html);

// export default {}
console.log('hi mane');

export default {}
