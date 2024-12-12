const multiparty = require('multiparty');
const { classifyImage } = require('../services/inferenceService');
const { storePrediction } = require('../services/storeData');
const { v4: uuidv4 } = require('uuid');
const InputError = require('../exceptions/InputError');
const { Firestore } = require('@google-cloud/firestore');

// Firestore setup for getHistoryHandler
const firestore = new Firestore({ databaseId: '(default)' });

const postPredictHandler = async (request, h) => {
  const { image } = request.payload;
  const { model } = request.server.app;
  const result = await classifyImage(model, image);
  const id = uuidv4();  // Generate a unique ID using UUID
  const data = {
    id: id,
    result: result,
  };

  // Store prediction to Firestore
  await storePrediction(id, result);

  const response = h.response({
    status: "success",
    message: "Model is predicted successfully",
    data,
  });
  response.code(201);
  return response;
};

const getHistoryHandler = async (request, h) => {
  try {
    const collection = firestore.collection('predictions');  // Firestore collection path

    console.log('Fetching prediction histories from Firestore...');
    const snapshots = await collection.get();
    const data = snapshots.docs.map(doc => ({
      id: doc.id,
      history: doc.data(),
    }));

    if (data.length === 0) {
      console.log('No history found.');
    }

    return {
      status: 'success',
      data: data,
    };
  } catch (error) {
    console.error('Error fetching histories:', error);
    return h.response({
      status: 'fail',
      message: 'Error fetching histories from Firestore',
    }).code(500);
  }
};

module.exports = { postPredictHandler, getHistoryHandler };
c283b4ky1451@backend:~/backend/src/server$ ls
handler.js  routes.js  server.js
c283b4ky1451@backend:~/backend/src/server$ cat routes.js 
const { postPredictHandler, getHistoryHandler } = require('./handler');

const routes = [
    {
      method: 'POST',
      path: '/predict',
      handler: postPredictHandler,
      options: {
        payload: {
          multipart: true,
          allow: 'multipart/form-data',
          maxBytes: 1000000, // Ukuran maksimal file 1MB
        },
      },
    },
    {
      method: 'GET',
      path: '/predict/histories',
      handler: getHistoryHandler,
    },
  ];
  
  module.exports = routes;
