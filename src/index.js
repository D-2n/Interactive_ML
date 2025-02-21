import '@marcellejs/core/dist/marcelle.css';
import { dashboard, text, imageUpload, imageDisplay, tfjsModel } from '@marcellejs/core';
import { Slider } from './components';
import { imageOutput } from './components/image-output';
import { heatmap } from './components/heatmap';
// import { imageDisplay } from './components/image-display';
import * as tf from '@tensorflow/tfjs'; 

const upload = imageUpload();
let imageArray = [];
const exampleImage = new Array(10000).fill(0).map(() => Math.random( ));

const unet = tfjsModel({
  inputType: 'generic',
  taskType: 'segmentation',
});
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


const predictionStream = upload.$images.map(async (image) => {
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
const pred_img = imageDisplay(predictionStream);

function imageDataToNormalizedGrayscale(imageData) {
  const { data, width, height } = imageData;
  const flatArray = new Array(width * height);
  for (let i = 0; i < width * height; i++) {
    // Since the image is grayscale, we can take the red channel.
    flatArray[i] = data[i * 4] / 255;
  }
  return Array(flatArray);
}

const flatPredictionStream = predictionStream.map((prediction) => {
  try {
    console.log('normalizing');
    return imageDataToNormalizedGrayscale(prediction);
  } catch (err) {
    console.error("Error converting prediction to grayscale array:", err);
    return [];
  }
});
const imageComponent = imageOutput({ imageArray: predictionStream, threshold: 0.5, contrast: 1, brightness: 1 });

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

const dash = dashboard({
  title: 'Tumor Segmentation Platform',
  author: 'Stevie Wonder'
});

dash.page('Welcome').use( sliderComponent, imageComponent,heatmapy).sidebar(upload, org_img, pred_img);
//dash.page('Heatmap').use(heatmapy);

dash.show();
