<script lang="ts">
  import { onMount, tick, createEventDispatcher } from 'svelte';
  import { Stream } from '@marcellejs/core';
  import { ViewContainer } from '@marcellejs/design-system';
  import { Button } from '@marcellejs/design-system';



  export let title: string;
  export let imageStream: Stream<ImageData> | Stream<ImageData[]>;

  let imageCanvas: HTMLCanvasElement;
  let imageCtx: CanvasRenderingContext2D;

  let isDrawing = false;
  let previous = { x: 0, y: 0 };
  let offset = { left: 0, top: 0 };

  const dispatch = createEventDispatcher();

  // Setup drawing event listeners
  function startDrawing(e: MouseEvent) {
    const rect = imageCanvas.getBoundingClientRect();
    offset = {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
    isDrawing = true;
    previous.x = e.clientX - offset.left;
    previous.y = e.clientY - offset.top;
  }

  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
    }
  }

  function draw(e: MouseEvent) {
    if (!isDrawing) return;
    const x = e.clientX - offset.left;
    const y = e.clientY - offset.top;
    imageCtx.beginPath();
    imageCtx.moveTo(previous.x, previous.y);
    imageCtx.lineTo(x, y);
    imageCtx.strokeStyle = 'red';
    imageCtx.lineWidth = 4;
    imageCtx.lineJoin = 'round';
    imageCtx.closePath();
    imageCtx.stroke();
    previous.x = x;
    previous.y = y;
  }

  function clearDrawing() {
    imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    
    isDrawing = false;
  }


  onMount(async () => {
    await tick();
    await tick(); // Ensures the DOM is fully rendered
    
    // Set up the canvases once they are bound
    imageCtx = imageCanvas.getContext('2d');

    // Listen for the imageStream updates
    imageStream.subscribe((img: ImageData | ImageData[]) => {
      if (img instanceof ImageData) {
        clearDrawing();
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;
        
        imageCtx.putImageData(img, 0, 0);
      } else if (Array.isArray(img)) {
        // Handle multiple images case if needed
      }
    });
  });
</script>

<ViewContainer {title}>
  <div class="relative w-full max-w-full">
    <!-- Bottom Canvas (image display) -->
    <canvas
      bind:this={imageCanvas}
      class="w-full max-w-full"
      style="z-index: 1; cursor: crosshair;"
      on:mousemove={draw}
      on:mousedown={startDrawing}
      on:mouseup={stopDrawing}
      on:mouseleave={stopDrawing}
    />
    <div class="m-1 z-3">
      <Button size="small" type="danger" on:click={clearDrawing}>Clear</Button>
    </div>
  </div>
</ViewContainer>


