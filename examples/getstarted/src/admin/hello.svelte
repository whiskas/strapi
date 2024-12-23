<script>
  let userCart = { total: 0 };

  // Example function to simulate an update
  const updateCart = () => {
    userCart = { total: userCart.total + 200 }; // Update total dynamically
  };
</script>

<div>
  <h1>Main Page</h1>
  <button on:click={updateCart}>Add $200 to Cart</button>
</div>
