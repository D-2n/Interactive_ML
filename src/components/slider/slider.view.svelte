<script>
  import { createEventDispatcher } from 'svelte';
  export let title;
  export let options;

  const dispatch = createEventDispatcher();
  let value = options.value;

  function handleChange(event) {
    value = event.target.value;
    options.value = value;
    dispatch('change', value);
  }
</script>

<div class="slider-container">
  <h3>{title}</h3>
  <input
    type="range"
    min={options.min}
    max={options.max}
    step={options.step}
    bind:value = {value}
    on:input={handleChange}
  />
  <span>{options.value}</span>
</div>

<style>
  .slider-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  input[type="range"] {
    width: 100%;
  }
</style>