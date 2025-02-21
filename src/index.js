import '@marcellejs/core/dist/marcelle.css';
import { dashboard, Stream, imageUpload, imageDisplay, tfjsModel } from '@marcellejs/core';
import { Slider } from './components';
import { ContrastSlider } from './components/contrastslider';
import { BrightnessSlider } from './components/brightnessslider';
import { imageOutput } from './components/image-output';
import { heatmap } from './components/heatmap';
import { ScanDisplay } from './components/image-display';
import { Brush } from './components/brush';
import * as tf from '@tensorflow/tfjs'; 

const upload = imageUpload();
upload.title = 'Upload your scan here!'
let imageArray = [];
const test_img = ScanDisplay(upload.$images);

const combineImageAndLabel = (image, label) => {
  return tf.tidy(() => {
    const imageTensor = tf.browser.fromPixels(image);
    const labelTensor = tf.browser.fromPixels(label);
    return { image: imageTensor, label: labelTensor };
  });
};

const prepareDataForTraining = (combinedData) => {
  const { image, label } = combinedData;
  const resizedImage = tf.image.resizeBilinear(image, [256, 256]);
  const resizedLabel = tf.image.resizeBilinear(label, [256, 256]);
  return { image: resizedImage, label: resizedLabel };
};
const fineTuneModel = async (unet, trainingData) => {
  const { image, label } = trainingData;
  const xs = image.expandDims(0); // Add batch dimension
  const ys = label.expandDims(0); // Add batch dimension
  ///const model = unet.getModel();
  if (unet) {
    unet.compile({
      optimizer: tf.train.adam(),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });
    
    const { image, label } = trainingData;
    const xs = image.expandDims(0); // Add batch dimension
    const ys = label.expandDims(0); // Add batch dimension
    
    await unet.fit(xs, ys, {
      epochs: 5,
      batchSize: 1,
    });

  } else {
    console.error("Underlying trainable model not found.");
  }


  console.log('Model fine-tuned successfully');
};
console.log('Test image:', test_img);

const unet = tfjsModel({
  inputType: 'generic',
  taskType: 'segmentation',
});

//const unet = tf.loadLayersModel('tfjs_model/model.json');
const modelFiles = [
  'tfjs_model/model.json',
  'tfjs_model/group1-shard1of30.bin',
  'tfjs_model/group1-shard2of30.bin',
  'tfjs_model/group1-shard3of30.bin',
  'tfjs_model/group1-shard4of30.bin',
  'tfjs_model/group1-shard5of30.bin',
  'tfjs_model/group1-shard6of30.bin',
  'tfjs_model/group1-shard7of30.bin',
  'tfjs_model/group1-shard8of30.bin',
  'tfjs_model/group1-shard9of30.bin',
  'tfjs_model/group1-shard10of30.bin',
  'tfjs_model/group1-shard11of30.bin',
  'tfjs_model/group1-shard12of30.bin',
  'tfjs_model/group1-shard13of30.bin',
  'tfjs_model/group1-shard14of30.bin',
  'tfjs_model/group1-shard15of30.bin',
  'tfjs_model/group1-shard16of30.bin',
  'tfjs_model/group1-shard17of30.bin',
  'tfjs_model/group1-shard18of30.bin',
  'tfjs_model/group1-shard19of30.bin',
  'tfjs_model/group1-shard20of30.bin',
  'tfjs_model/group1-shard21of30.bin',
  'tfjs_model/group1-shard22of30.bin',
  'tfjs_model/group1-shard23of30.bin',
  'tfjs_model/group1-shard24of30.bin',
  'tfjs_model/group1-shard25of30.bin',
  'tfjs_model/group1-shard26of30.bin',
  'tfjs_model/group1-shard27of30.bin',
  'tfjs_model/group1-shard28of30.bin',
  'tfjs_model/group1-shard29of30.bin',
  'tfjs_model/group1-shard30of30.bin'
];

const fetchFile = async (url) => {
  const response = await fetch(url);
  const data = await response.blob();
  return new File([data], url.split('/').pop(), { type: data.type });
};

Promise.all(modelFiles.map(fetchFile)).then(files => {
  unet.loadFromFiles(files).then(() => {
    console.log('Model loaded successfully');
  }).catch(error => {
    console.error('Error loading model:', error);
  });
});
const tensorToImageData = async (tensor) => {
  const [height, width] = tensor.shape.slice(0, 2);
  const imageDataArray = await tf.browser.toPixels(tensor);
  const imageData = new ImageData(new Uint8ClampedArray(imageDataArray), width, height);
  return imageData;
};
async function runSegmentation(image) {
  console.log('Running segmentation');
  const grayscaleImage = toGrayscale(image);
  const normalizedImage = grayscaleImage.div(255);
  const resizedImage = tf.image.resizeBilinear(normalizedImage, [256, 256]);
  
  let predictionData = null;
  try {
    predictionData = await unet.predict(resizedImage.arraySync());
  } catch(err){
    console.log('Unet prediction error: ', err);
  }
  // Dispose intermediate tensors.
  grayscaleImage.dispose();
  normalizedImage.dispose();
  resizedImage.dispose();
  return predictionData;
}
const toGrayscale = (image) => {
  return tf.tidy(() => {
    console.log('Image type:', image.constructor.name);
    let tensor;
    if (image instanceof tf.Tensor) {
      tensor = image;
    } else if (image instanceof ImageData) {
      tensor = tf.browser.fromPixels(image);
      console.log('Is image data man')
    } else {
      throw new Error('Unsupported image type');
    }
    const grayscaleTensor = tensor.mean(2).expandDims(2);
    return grayscaleTensor;
  });
};


const predictionStream = test_img.images.map(async (image) => {
  const grayscaleImage = toGrayscale(image);
  const normalizedImage = grayscaleImage.div(255); 
  const resizedImage = tf.image.resizeBilinear(normalizedImage, [256, 256]);
 
  let predictionData = null;
  try{
    predictionData = await unet.predict(resizedImage.arraySync()); 
  }
  catch(err){
    console.log('Unet is being a baby: ', err);
  }
  grayscaleImage.dispose();
  normalizedImage.dispose();
  resizedImage.dispose();
  return predictionData;
}).awaitPromises();



const org_img = imageDisplay(upload.$images);
test_img.title = 'Original image';
const pred_img = imageDisplay(predictionStream);
pred_img.title = 'Segmentation prediction';
const adjustedUpload = imageDisplay(upload.$images);

function imageDataToNormalizedGrayscale(imageData) {
  const { data, width, height } = imageData;
  const flatArray = new Array(width * height);
  for (let i = 0; i < width * height; i++) {
    // Since the image is grayscale, we can take the red channel.
    flatArray[i] = data[i * 4] / 255;
  }
  return Array(flatArray);
}
const imageComponent = imageOutput({ imageArray: predictionStream, threshold: 0.5, contrast: 1, brightness: 1 });
imageComponent.title='Thresholded segmentation';
const heatmapy = heatmap({ imageArray: predictionStream});

const sliderComponent = new Slider({
  min: 0,
  max: 1,
  step: 0.01,
  initialValue: 0.5,
  onChange: (val) => {
    imageComponent.updateThreshold(val);
  },
});
const contrastSliderComponent = new ContrastSlider({
    min: 0,
    max: 2,
    step: 0.01,
    initialValue: 1,
    onChange: (val) => {
      console.log("Contrast value:", val);
      test_img.updateContrast(val); 
    },
  });
  
const brightnessSliderComponent = new BrightnessSlider({
    min: 0.2,
    max: 1.2,
    step: 0.01,
    initialValue: 0.7,
    onChange: (val) => {
      console.log("Brightness value:", val);
      test_img.updateBrightness(val); 
    },
  });

const labelStream = new Stream();
const brushComponent = new Brush(upload.$images);

brushComponent.$on('retrain', async (event) => {
  console.log("Retrain event received in index.js", event);
  const { label } = event.detail; // Label from brush.
  
  // Convert the label to grayscale
  const grayscaleLabel = toGrayscale(label);
  const normalizedLabel = grayscaleLabel.div(255);
  const image_indata = await tensorToImageData(normalizedLabel);

  // Display the grayscale label in the labelDisplay component.
  labelStream.set(image_indata);
});


const labelDisplay = imageDisplay(labelStream);
labelDisplay.title = 'Drawn label';
const dash = dashboard({
  title: 'Tumor Segmentation Platform',
  author: 'Stevie Wonder'
});
  
dash.page('Welcome').use( [pred_img, brushComponent], [sliderComponent], [imageComponent,heatmapy,labelDisplay]).sidebar(upload, test_img,brightnessSliderComponent, contrastSliderComponent);
//dash.page('Heatmap').use(heatmapy);

dash.show();