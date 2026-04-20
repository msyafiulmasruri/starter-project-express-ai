import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
import * as tf from '@tensorflow/tfjs';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(import.meta.url);
const metadata = require('../model/metadata.json');

// Load model dari disk secara manual tanpa fetch / file://
// karena @tensorflow/tfjs pure JS tidak support keduanya di Node.js
function loadModelHandler(modelDir) {
  return {
    load: async () => {
      const modelJsonPath = resolve(modelDir, 'model.json');
      const modelJson = JSON.parse(readFileSync(modelJsonPath, 'utf-8'));

      const weightPaths = modelJson.weightsManifest.flatMap((w) => w.paths);
      const weightBuffers = weightPaths.map((p) =>
        readFileSync(resolve(modelDir, p))
      );

      const weightData = Buffer.concat(weightBuffers);

      return {
        modelTopology: modelJson.modelTopology,
        weightSpecs: modelJson.weightsManifest.flatMap((w) => w.weights),
        weightData: weightData.buffer.slice(
          weightData.byteOffset,
          weightData.byteOffset + weightData.byteLength
        ),
        format: modelJson.format,
        generatedBy: modelJson.generatedBy,
        convertedBy: modelJson.convertedBy,
      };
    },
  };
}

async function bufferToTensor(photoBuffer) {
  const Jimp = (await import('jimp')).default;
  const image = await Jimp.read(Buffer.from(photoBuffer));

  image.resize(224, 224);

  const pixels = [];
  image.scan(
    0,
    0,
    image.bitmap.width,
    image.bitmap.height,
    function (x, y, idx) {
      pixels.push(this.bitmap.data[idx] / 255.0);
      pixels.push(this.bitmap.data[idx + 1] / 255.0);
      pixels.push(this.bitmap.data[idx + 2] / 255.0);
    }
  );

  return tf.tensor4d(pixels, [1, 224, 224, 3]);
}

export async function predictImage(photo) {
  const modelDir = resolve(__dirname, '..', 'model');
  const model = await tf.loadLayersModel(loadModelHandler(modelDir));

  const tensor = await bufferToTensor(photo);

  const predict = model.predict(tensor);
  const score = await predict.data();
  const confidenceScore = Math.max(...score);
  const label = tf.argMax(predict, 1).dataSync()[0];

  const diseaseLabels = metadata.labels;
  const diseaseLabel = diseaseLabels[label];

  tensor.dispose();
  predict.dispose();

  return { confidenceScore, diseaseLabel };
}
