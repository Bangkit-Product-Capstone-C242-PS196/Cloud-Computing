const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

const classifyImage = async (model, image) => {
  try {
    // Memastikan input adalah gambar
    if (!image || !image._data) {
      throw new InputError('Input tidak valid: Gambar tidak ditemukan.');
    }

    // Mengubah gambar menjadi tensor
    const tensor = tf.node.decodeJpeg(image._data)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat();

    // Melakukan prediksi
    const predictions = model.predict(tensor);
    const score = await predictions.data();

    // Mengambil kelas dengan confidence score tertinggi
    const classIndex = score.indexOf(Math.max(...score));
    const confidenceScore = score[classIndex];

    // Pemetaan nilai score berdasarkan kelas
    const scoreMapping = {
      0: 1000,
      1: 2000,
      2: 5000,
      3: 10000,
      4: 20000,
      5: 50000,
      6: 100000
    };

    // Mendapatkan nilai score berdasarkan kelas
    const classScore = scoreMapping[classIndex] || 'Invalid class index';

    // Mengembalikan kelas, confidence score, dan nilai score
    return {
      class: classIndex, // Anda bisa mengganti ini dengan nama kelas jika ada
      confidence: confidenceScore,
      score: classScore
    };
  } catch (error) {
    console.error('Error during image classification:', error);
    throw new InputError(`Terjadi kesalahan input: ${error.message}`);
  }
};

module.exports = { classifyImage };
