import { Component } from '@marcellejs/core';
import View from './brush.view.svelte';
import { Stream } from '@marcellejs/core';
import { never } from '@most/core';

export class Brush extends Component {
  #thumbnailCanvas;
  #thumbnailCanvasWidth;
  #thumbnailCanvasHeight;
  #thumbnailCtx;
  #sketchCtx;
  #drawCanvas;  // New drawing canvas
  #drawCtx;     // Drawing context for the new canvas
  sketchElement;

  constructor(imageStream) {
    super();
    this.title = 'brush';

    // Initialize streams
    this.imageStream = imageStream;
    this.$images = new Stream(never());  // Stream for the full image
    this.$thumbnails = new Stream(never());  // Stream for the thumbnail
    this.$strokeStart = new Stream(never());
    this.$strokeEnd = new Stream(never());

    // Initialize properties for the sketch
    this.#thumbnailCanvas = document.createElement('canvas');
    this.#thumbnailCanvasWidth = imageStream.width;
    this.#thumbnailCanvasHeight = imageStream.height;
    this.#thumbnailCtx = this.#thumbnailCanvas.getContext('2d');

    // Set up the new drawing canvas
    this.#drawCanvas = document.createElement('canvas');
    this.#drawCanvas.width = this.#thumbnailCanvasWidth;
    this.#drawCanvas.height = this.#thumbnailCanvasHeight;
    this.#drawCtx = this.#drawCanvas.getContext('2d');

    this.setupCapture();

    // Subscribe to the strokeEnd stream to capture the image
    this.$strokeEnd.subscribe(() => {
      this.capture();
    });
    this.start();  // Assuming start is defined elsewhere
  }

  // Mount the component into a target element
  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        strokeStart: this.$strokeStart,
        strokeEnd: this.$strokeEnd,
        imageStream: this.imageStream,  // Passing image stream to the View component
      },
    });

    // Listen for the 'canvasElement' event from the View component
    this.$$.app.$on('canvasElement', (e) => {
      this.sketchElement = e.detail;
      this.#sketchCtx = this.sketchElement.getContext('2d');
    });
  }

  // Set up the capture mechanism for thumbnails and full images
  setupCapture() {
    // Initialize properties for capturing the image
    this.#thumbnailCanvas = document.createElement('canvas');
    this.#thumbnailCanvas.width = this.#thumbnailCanvasWidth;
    this.#thumbnailCanvas.height = this.#thumbnailCanvasHeight;
    this.#thumbnailCtx = this.#thumbnailCanvas.getContext('2d');
  }

  // Capture both the thumbnail and full image data
  capture() {
    const t = this.captureThumbnail();
    this.$thumbnails.set(t);  // Set thumbnail in the stream
    this.$images.set(this.captureImage());  // Set full image in the stream
  }

  // Capture the thumbnail from the sketch
  captureThumbnail() {
    this.#thumbnailCtx.drawImage(
      this.sketchElement,
      0,
      0,
      this.#thumbnailCanvas.width,
      this.#thumbnailCanvas.height
    );
    return this.#thumbnailCanvas.toDataURL('image/jpeg');
  }

  // Capture the full image from the sketch
  captureImage() {
    return this.#sketchCtx.getImageData(0, 0, this.sketchElement.width, this.sketchElement.height);
  }

  // New method to draw on the new #drawCanvas
  startDrawingOnDrawCanvas(e) {
    // For example, handle mouse events for drawing
    const rect = this.#drawCanvas.getBoundingClientRect();
    const offset = {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };

    const x = e.clientX - offset.left;
    const y = e.clientY - offset.top;
    this.#drawCtx.beginPath();
    this.#drawCtx.moveTo(x, y);
    this.#drawCtx.strokeStyle = 'red';
    this.#drawCtx.lineWidth = 4;
    this.#drawCtx.lineJoin = 'round';
    this.#drawCtx.closePath();
    this.#drawCtx.stroke();
  }
}
