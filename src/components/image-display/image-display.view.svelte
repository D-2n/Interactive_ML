<script>
  import { onMount } from 'svelte';

  export let title = 'Original Image Component';
  export let imageArray = null; // Store image as a full object
  import { ViewContainer } from '@marcellejs/design-system';

  let canvas;
  let context;
  let img = new Image();

  onMount(() => {
    context = canvas.getContext('2d');
    if (imageArray) drawImage();
  });

  function drawImage() {
    if (!context || !imageArray) return;

    console.log("Drawing Original Image...");

    img.src = URL.createObjectURL(imageArray); // Set image source
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.style.width = "300px";
      canvas.style.height = "400px";

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, img.width, img.height);
    };
  }

  $: if (imageArray) {
    drawImage();
  }
</script>
<ViewContainer {title}>
<canvas bind:this={canvas}></canvas>

</ViewContainer>

<style>
  canvas {
    border: 1px solid black;
  }
</style>
