<script lang="ts">
  import { onDestroy, onMount, tick, createEventDispatcher } from 'svelte';
  import { Stream } from '@marcellejs/core';
  import { ViewContainer, Button } from '@marcellejs/design-system';

  export let title: string;
  export let strokeStart: any;
  export let strokeEnd: any;
  export let imageStream: Stream<ImageData> | Stream<ImageData[]>;

  let imageCanvas: HTMLCanvasElement;
  let imageCtx: CanvasRenderingContext2D;
  let drawCanvas: HTMLCanvasElement;  // Extra canvas for drawing
  let drawCtx: CanvasRenderingContext2D;  // Context for extra canvas

  let isDrawing = false;
  let previous = { x: 0, y: 0 };
  let offset = { left: 0, top: 0 };

  const dispatch = createEventDispatcher();

  function noop() {
    // Do nothing
  }

  let unSub = noop;

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
    strokeStart.set();
  }

  function stopDrawing() {
    if (isDrawing) {
      isDrawing = false;
      strokeEnd.set();
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

  function captureDrawing() {
    const label = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
    console.log("Capturing drawing, dispatching 'labelCaptured' event.");
    dispatch('labelCaptured', { label });
  }

  function retrainModel() {
    const label = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
    const orig_image = imageCtx.getImageData(0,0, imageCanvas.width, imageCanvas.height)
    console.log("Retrain button clicked. Dispatching 'retrain' event with image:", orig_image);
    dispatch('retrain', { label , orig_image});
  }

  onMount(async () => {
    await tick();
    await tick(); // Ensures the DOM is fully rendered
    
    imageCtx = imageCanvas.getContext('2d');
    console.log('imageCanvas context initialized:', imageCtx);
    drawCtx = drawCanvas.getContext('2d');
    console.log('drawCanvas context initialized:', drawCtx);

    unSub = imageStream.subscribe((img: ImageData | ImageData[]) => {
      if (Array.isArray(img) && img.length === 0) return;
      if (img instanceof ImageData) {
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;

        // Set the drawCanvas size to match the imageCanvas size
        drawCanvas.width = img.width;
        drawCanvas.height = img.height;
        clearDrawing(imageCanvas, imageCtx);

        imageCtx.putImageData(img, 0, 0);
      } else if (Array.isArray(img)) {
        // Handle multiple images case if needed
      }
    });

    dispatch('canvasElement', drawCanvas);
  });

  onDestroy(() => {
    console.log('Brush Component destroyed, unsubscribing from image stream');
    unSub();
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
      <Button size="small" type="danger" on:click={() => clearDrawing(drawCanvas, drawCtx)}>
        Clear Drawing Canvas
      </Button>
      <Button size="small" type="primary" on:click={captureDrawing}>
        Capture Drawing
      </Button>
      <Button size="small" type="success" on:click={retrainModel}>
        Retrain
      </Button>
    </div>
  </div>
</ViewContainer>

<style>
  .relative { position: relative; }
  .absolute { position: absolute; }
  .z-3 { z-index: 3; }
  canvas {
    display: block;
  }
</style>
