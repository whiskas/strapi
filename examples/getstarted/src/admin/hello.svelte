<script>
  export let userCart = { total: 0 };
  export let name;

  // Example function to simulate an update
  const updateCart = () => {
    console.log('hello', userCart.total);
    userCart = { total: userCart.total + 200 }; // Update total dynamically
  };
</script>

<div>
  <h1>{name}</h1>
  <button on:click={updateCart}>Add $200 to Cart</button>
  <div>cart is {userCart.total}</div>
</div>
