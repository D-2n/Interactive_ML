<script lang="ts">
  import { onMount, tick, createEventDispatcher } from 'svelte';
  import { Stream } from '@marcellejs/core';
  import { ViewContainer } from '@marcellejs/design-system';
  import { Button } from '@marcellejs/design-system';

  export let title: string;
  export let imageStream: Stream<ImageData> | Stream<ImageData[]>;

  let imageCanvas: HTMLCanvasElement;
  let imageCtx: CanvasRenderingContext2D;
  let drawCanvas: HTMLCanvasElement;  // Extra canvas for drawing
  let drawCtx: CanvasRenderingContext2D;  // Context for extra canvas

  let isDrawing = false;
  let previous = { x: 0, y: 0 };
  let offset = { left: 0, top: 0 };

  const dispatch = createEventDispatcher();

  // Setup drawing event listeners for both canvases
  function startDrawing(e: MouseEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
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

  function draw(e: MouseEvent, ctx: CanvasRenderingContext2D) {
    if (!isDrawing) return;
    const x = e.clientX - offset.left;
    const y = e.clientY - offset.top;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.closePath();
    ctx.stroke();
    previous.x = x;
    previous.y = y;
  }

  function clearDrawing(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isDrawing = false;
  }

  onMount(async () => {
    await tick();
    await tick(); // Ensures the DOM is fully rendered
    
    // Set up the canvases once they are bound
    imageCtx = imageCanvas.getContext('2d');
    drawCtx = drawCanvas.getContext('2d');

    // Listen for the imageStream updates
    imageStream.subscribe((img: ImageData | ImageData[]) => {
      if (img instanceof ImageData) {
        clearDrawing(imageCanvas, imageCtx);

        // Set the imageCanvas size based on the image's original size
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;

        // Set the drawCanvas size to match the imageCanvas size
        drawCanvas.width = img.width;
        drawCanvas.height = img.height;

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
      style="z-index: 1;"
    />
    
    <!-- Extra Drawing Canvas -->
    <canvas
      bind:this={drawCanvas}
      class="absolute top-0 left-0"
      style="z-index: 2; cursor: crosshair;"
      on:mousemove={(e) => draw(e, drawCtx)}  
      on:mousedown={(e) => startDrawing(e, drawCanvas)}
      on:mouseup={stopDrawing}
      on:mouseleave={stopDrawing}
    />
    
    <div class="m-1 z-3">
      <Button size="small" type="danger" on:click={() => clearDrawing(drawCanvas, drawCtx)}>Clear Drawing Canvas</Button>
    </div>
  </div>
</ViewContainer>
