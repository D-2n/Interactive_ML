<svelte:options accessors />

<script lang="ts">
  import type { Stream } from '../../core/stream';
  import { onDestroy, onMount, tick } from 'svelte';
  import { ViewContainer } from '@marcellejs/design-system';

  export let title: string;
  export let imageStream: Stream<ImageData> | Stream<ImageData[]>;
  export let brightness: number = 1; // External brightness value
  export let contrast: number = 1; // External contrast value

  let canvas: HTMLCanvasElement;

  function noop() {
    // Do nothing
  }

  let unSub = noop;
  let currentImage: ImageData | null = null;

  // Function to apply brightness and contrast to an ImageData object
  function applyBrightnessContrast(imageData: ImageData, brightness: number, contrast: number): ImageData {
    console.log('Applying brightness and contrast:', { brightness, contrast });
    // Clone the ImageData to avoid modifying the original
    const clonedData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    const data = clonedData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply brightness and contrast
      for (let j = 0; j < 3; j++) { // Loop through RGB channels
        data[i + j] = Math.min(255, Math.max(0, contrast * (data[i + j] * brightness - 128) + 128));
      }
    }

    return clonedData;
  }

  // Function to render the image with brightness and contrast adjustments
  function renderImage() {
    console.log('Rendering image with current settings:', { brightness, contrast });
    if (canvas && currentImage) {
      const ctx = canvas.getContext('2d');
      const adjustedImageData = applyBrightnessContrast(currentImage, brightness, contrast);
      ctx.putImageData(adjustedImageData, 0, 0); // Use putImageData instead of drawImage
    }
  }

  onMount(async () => {
    await tick();
    await tick();
    const ctx = canvas.getContext('2d');
    console.log('Canvas context initialized:', ctx);

    // Subscribe to the imageStream
    unSub = imageStream.subscribe((img: ImageData | ImageData[]) => {
      console.log('Received new image from stream:', img);
      if (Array.isArray(img) && img.length === 0) return;

      if (img instanceof ImageData) {
        canvas.width = img.width;
        canvas.height = img.height;
        currentImage = img; // Store the current image
        renderImage(); // Render the image with adjustments
      } else if (Array.isArray(img)) {
        throw new Error('This component does not yet support multiple images');
      }
    });
  });

  onDestroy(() => {
    console.log('Component destroyed, unsubscribing from image stream');
    unSub();
  });

  // Watch for changes in brightness and contrast
  $: {
    console.log('Reactive statement triggered:', { brightness, contrast });
    if (currentImage) {
      console.log('Brightness or contrast changed, re-rendering image');
      renderImage(); // Re-render the image whenever brightness or contrast changes
    }
  }
</script>

<ViewContainer {title}>
  <canvas bind:this={canvas} class="w-full max-w-full" />
</ViewContainer>

<style>
  .slider-container {
    margin-bottom: 1rem;
  }
  input[type="range"] {
    width: 100%;
  }
</style>