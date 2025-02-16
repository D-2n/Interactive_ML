<script>
  import { onMount } from 'svelte';

  export let imageArray = [];
  export let threshold = 128;
  export let contrast = 1;
  export let brightness = 0;

  let canvas;
  let context;

  onMount(() => {
    context = canvas.getContext('2d');
    drawImage();
  });

 function drawImage() {
    if (!context || !imageArray.length) return;

    console.log("Drawing with threshold:", threshold);
    console.log("Drawing with contrast:", contrast);
    console.log("Drawing with brightness:", brightness);

    const width = Math.sqrt(imageArray.length);
    const height = width;
    const scale = 5; // Increase resolution for better sharpness

    // Set higher resolution internally
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;  // Keep display size same
    canvas.style.height = `${height}px`;

    const imageData = context.createImageData(width, height);

    for (let i = 0; i < imageArray.length; i++) {
      let value = imageArray[i];

      // Apply thresholding with smoother transition
      value = value > threshold ? 0 : 255;

      // Apply contrast
      value = (value - 128) * contrast + 128;

      // Apply brightness
      value = value + (255 * (brightness - 1));

      // Keep value in valid range [0, 255]
      value = Math.max(0, Math.min(255, value));

      imageData.data[i * 4] = value;     // Red
      imageData.data[i * 4 + 1] = value; // Green
      imageData.data[i * 4 + 2] = value; // Blue
      imageData.data[i * 4 + 3] = 255;   // Alpha (fully opaque)
    }

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const offscreenContext = offscreenCanvas.getContext('2d');

    offscreenContext.putImageData(imageData, 0, 0);

    // Clear before drawing
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(offscreenCanvas, 0, 0, width * scale, height * scale);
  }

  $: if (imageArray && threshold && contrast && brightness !== undefined) {
    drawImage();
  };
</script>

<canvas bind:this={canvas} style="width: 300px; height: 400px;"></canvas>

<style>
  canvas {
    border: 1px solid black;
  }
</style>
