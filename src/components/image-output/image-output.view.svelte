<script>
  import { onMount } from 'svelte';
  import { ViewContainer } from '@marcellejs/design-system';

  export let imageArray = []; // Initialize with an empty array
  export let threshold = 0.5;
  export let title = "Tumor Prediction";

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

  function drawImage() {
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
    
    console.log("Width and Height image out:", width, height); // Log width and height
    // Set canvas dimensions to the fixed size.
    const canvasWidth = 256;
    const canvasHeight = 256;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Create a new ImageData object.
    const outputData = context.createImageData(width, height);
    for (let i = 0; i < normalizedArray.length; i++) {
      const prob = normalizedArray[i];
      // Binarize: if probability > threshold, pixel is white (255), else black (0).
      const binary = prob > threshold ? 255 : 0;
      outputData.data[i * 4 + 0] = binary; // Red
      outputData.data[i * 4 + 1] = binary; // Green
      outputData.data[i * 4 + 2] = binary; // Blue
      outputData.data[i * 4 + 3] = 255;    // Alpha (opaque)
    }
    
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
    drawImage();
  });

  // Re-run drawImage whenever imageArray or threshold changes.
  $: {
    console.log('imageArray or threshold changed', { imageArray, threshold });
    drawImage();
  }
</script>

<ViewContainer {title}>
  <canvas bind:this={canvas} style="border: 1px solid white;"></canvas>
</ViewContainer>

<style>
  canvas {
    display: block;
    width: 256px;
    height: 256px;
  }
</style>