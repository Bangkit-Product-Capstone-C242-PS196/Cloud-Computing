const { Firestore } = require('@google-cloud/firestore');


const storePrediction = async (id, result) => {
  try {

    // databaseId disesuaikan dengan nama database Firestore
    const firestore = new Firestore({databaseId: '(default)'});
    const collection = firestore.collection("prediction");
    const createdAt = new Date().toISOString();

    console.log('Storing prediction to Firestore...');
    await collection.doc(id).set({
      id,
      result,
      createdAt,
    });


    console.log('Prediction stored successfully');
    return { id, result, createdAt };
  } catch (error) {
    console.error('Error storing prediction to Firestore:', error);
    throw new Error('Failed to store prediction');
  }
};


module.exports = { storePrediction };
