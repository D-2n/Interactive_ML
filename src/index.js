import '@marcellejs/core/dist/marcelle.css';
import { dashboard, text, imageUpload, imageDisplay, tfjsModel } from '@marcellejs/core';
import { Slider } from './components';
import { imageOutput } from './components/image-output';
import { heatmap } from './components/heatmap';
// import { imageDisplay } from './components/image-display';
import * as tf from '@tensorflow/tfjs'; 
const x = text('hello :3');

const upload = imageUpload();
let imageArray = [];
const exampleImage = new Array(100000).fill(0).map(() => Math.random());

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
    console.log('Image type:', image.constructor.name); // Log the image type
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
  //const resizedImage = resizeImage(image);
  const grayscaleImage = toGrayscale(image);
  const normalizedImage = grayscaleImage.div(255); // Normalize the tensor values to [0, 1]
  const resizedImage = tf.image.resizeBilinear(normalizedImage, [256, 256]);
  // Ensure the tensor has the correct shape [1, 256, 256, 1]
  //const reshapedImage = normalizedImage.reshape([1, 256, 256, 1]);
 
  //const imageData = await tensorToImageData(normalizedImage);
  let prediction = null;
  try{
    prediction = await unet.predict(resizedImage.arraySync());
  }
  catch(err){
    console.log('Unet is being a baby: ', err);
  }
  grayscaleImage.dispose();
  normalizedImage.dispose();
  //reshapedImage.dispose();
  return prediction;
}).awaitPromises();



//const predictionStream = upload.$images.map(unet.predict).awaitPromises();
//const org_img = new imageDisplay({ imageArray});
const org_img = imageDisplay(upload.$images);
const pred_img = imageDisplay(predictionStream);

  

const imageComponent =  imageOutput({ imageArray: predictionStream, threshold: 0.1 });

const heatmapy = heatmap({ imageArray: predictionStream, width: 100, height: 100 });

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
  title: 'My Marcelle App!',
  author: 'Marcelle Doe'
});

dash.page('Welcome').use(x, sliderComponent, imageComponent).sidebar(upload, org_img, pred_img);
dash.page('Heatmap').use(heatmapy);

dash.show();
