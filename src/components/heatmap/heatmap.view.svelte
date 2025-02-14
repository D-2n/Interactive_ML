<script>
  import { onMount } from 'svelte';

  export let title = 'Heatmap Component';
  export let imageArray = []; // ❗ Changed: Use `imageArray` directly
  export let threshold = 0.5;

  let canvas;
  let context;

  onMount(() => {
    context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    drawHeatmap();
  });

  function drawHeatmap() {
    if (!context || !imageArray || imageArray.length === 0) return;

    console.log("Drawing Heatmap with", imageArray.length, "pixels");

    const width = Math.sqrt(imageArray.length);
    const height = width;
    
    // ✅ Set the canvas to match the data resolution
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = "300px";  // Keep display size
    canvas.style.height = "400px";

    const imageData = context.createImageData(width, height);

    for (let i = 0; i < imageArray.length; i++) {
      let normalizedValue = imageArray[i] ?? 0; // Prevent undefined values
      let [r, g, b] = getHeatmapColor(normalizedValue);

      imageData.data[i * 4] = r;
      imageData.data[i * 4 + 1] = g;
      imageData.data[i * 4 + 2] = b;
      imageData.data[i * 4 + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);
  }

  function getHeatmapColor(value) {
    let r = 0, g = 0, b = 0;
    if (value < 0.25) {
      r = 0;
      g = value * 4 * 255;
      b = 255;
    } else if (value < 0.5) {
      r = 0;
      g = 255;
      b = (1 - (value - 0.25) * 4) * 255;
    } else if (value < 0.75) {
      r = (value - 0.5) * 4 * 255;
      g = 255;
      b = 0;
    } else {
      r = 255;
      g = (1 - (value - 0.75) * 4) * 255;
      b = 0;
    }
    return [r, g, b];
  }

  // ✅ Ensure reactivity updates
  $: if (imageArray.length > 0) {
    drawHeatmap();
  }
</script>

<h3>{title}</h3>
<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    border: 1px solid black;
    image-rendering: pixelated;
  }
</style>
