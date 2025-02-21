<script>
  import { onMount } from 'svelte';
  import { ViewContainer } from '@marcellejs/design-system';

  export let imageArray = []; // Initialize with an empty array
  export let title = "Heatmap";

  let canvas;
  let context;
  let normalizedArray = [];
  let width = 32;
  let height = 32;

  // Converts an ImageData object to a flat array of probabilities (0-1).
  function convertImageDataToProbabilities(imgData) {
    const { data, width, height } = imgData;
    const probabilities = new Array(width * height);
    // Since the prediction is grayscale, we use the red channel.
    for (let i = 0; i < width * height; i++) {
      // Normalize by dividing by 255.
      probabilities[i] = data[i * 4] / 255;
    }
    return { probabilities, width, height };
  }

  function getHeatmapColor(value) {
    let r, g, b;
    if (value < 0.33) {
      r = 0;
      g = Math.floor(value * 3 * 255);
      b = 255;
    } else if (value < 0.66) {
      r = Math.floor((1 - (value - 0.33) * 3) * 255);
      g = 255;
      b = 0;
    } else {
      r = 255;
      g = 0;
      b = 0;
    }
    return [r, g, b];
  }

  

  function drawHeatmap() {
    if (!context || !imageArray || imageArray.length === 0) {
      console.log("No image data to draw.");
      return;
    }
    
    // If imageArray is an ImageData object, convert it.
    if (imageArray instanceof ImageData) {
      const result = convertImageDataToProbabilities(imageArray);
      normalizedArray = result.probabilities;
      width = result.width;
      height = result.height;
    }
    // If it's already a flat array of probabilities, assume it's square.
    else if (typeof imageArray.slice === 'function') {
      normalizedArray = imageArray;
      width = Math.sqrt(normalizedArray.length);
      height = width;
    } else {
      console.error("Unsupported imageArray type:", imageArray);
      return;
    }

    console.log("Normalized array:", normalizedArray.slice(0, 10)); // Log the first 10 values
    console.log("Width and Height:", width, height); // Log width and height

    // Ensure width and height are valid integers
    if (!Number.isInteger(width) || !Number.isInteger(height)) {
      console.error("Width and height are not valid integers:", width, height);
      return;
    }

    // Set canvas dimensions to the fixed size.
    const canvasWidth = 256;
    const canvasHeight = 256;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Create a new ImageData object.
    const outputData = context.createImageData(width, height);
    for (let i = 0; i < normalizedArray.length; i++) {
      const prob = normalizedArray[i];
      const [r, g, b] = getHeatmapColor(prob);
      outputData.data[i * 4 + 0] = r; // Red
      outputData.data[i * 4 + 1] = g; // Green
      outputData.data[i * 4 + 2] = b; // Blue
      outputData.data[i * 4 + 3] = 255; // Alpha (opaque)
    }

    console.log("Output data:", outputData.data.slice(0, 40)); // Log the first 40 values of the output data

    // Scale the image to fit the canvas.
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempContext = tempCanvas.getContext('2d');
    tempContext.putImageData(outputData, 0, 0);
    context.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);
  }

  onMount(() => {
    context = canvas.getContext('2d');
    drawHeatmap();
  });

  // Re-run drawHeatmap whenever imageArray changes.
  $: {
    console.log('heatmapping', { imageArray });
    drawHeatmap();
  }
</script>

<ViewContainer {title}>
  <canvas bind:this={canvas} style="border: 1px solid black;"></canvas>
</ViewContainer>

<style>
  canvas {
    display: block;
    width: 256px;
    height: 256px;
  }
</style>