const { Firestore } = require('@google-cloud/firestore');
require('dotenv').config();

async function testFirestore() {
  try {
    console.log('Testing Firestore connection...');
    console.log('Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
    
    const firestore = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });
    
    // Try to write a test document
    const testDoc = {
      test: true,
      timestamp: new Date()
    };
    
    await firestore.collection('test').doc('connection-test').set(testDoc);
    console.log('✅ Firestore write successful');
    
    // Try to read it back
    const doc = await firestore.collection('test').doc('connection-test').get();
    if (doc.exists) {
      console.log('✅ Firestore read successful:', doc.data());
    }
    
    // Clean up
    await firestore.collection('test').doc('connection-test').delete();
    console.log('✅ Test document cleaned up');
    
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    console.error('Full error:', error);
  }
}

testFirestore();
