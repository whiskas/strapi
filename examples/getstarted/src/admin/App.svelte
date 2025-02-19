<script>

  import Home from "./Home.svelte";
  import Layout from  "./Layout.svelte"
  // export let name;
  const props = $props();

  let userCart = $state({ total: 0 });
  console.log('$props', props);
  const { name } = props;


  // Example function to simulate an update
  const updateCart = () => {
    console.log('hello', userCart.total);
    userCart = { total: userCart.total + 200 }; // Update total dynamically
  };
</script>

<svelte:head>
  <style>
    h1 {
      color: blue;
    }
  </style>
</svelte:head>

<div>
  <h1>{name}</h1>
  <button onclick={updateCart}>Add $200 to Cart</button>
  <div>cart is {userCart.total}</div>

  <Layout>
    <Home/>
  </Layout>

</div>
