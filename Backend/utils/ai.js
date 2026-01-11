const tf = require('@tensorflow/tfjs');
const axios = require('axios');
const jpeg = require('jpeg-js'); // Pure JS JPEG decoder

// Load MobileNet model
let model;
const loadModel = async () => {
    if (!model) {
        console.log("⏳ Loading AI Model...");
        // MobileNet V2 (Lightweight)
        model = await tf.loadGraphModel('https://www.kaggle.com/models/google/mobilenet-v2/frameworks/TfJs/variations/035-128-classification/versions/3', { fromTFHub: true });
        console.log("✅ AI Model Loaded!");
    }
    return model;
};

const getImageVector = async (imageUrl) => {
    try {
        const model = await loadModel();

        // 🔥 FIX 1: Force Cloudinary to return JPG
        // jpeg-js library sirf JPEG padh sakti hai. Agar user ne PNG daala to crash hoga.
        // Hum URL change karke Cloudinary ko bolenge ki JPG bheje.
        let fetchUrl = imageUrl;
        if (imageUrl.includes("cloudinary.com")) {
             // Extension hata kar .jpg laga do (Auto-convert by Cloudinary)
             fetchUrl = imageUrl.replace(/\.[^/.]+$/, "") + ".jpg";
        }

        console.log(`🤖 AI Fetching: ${fetchUrl}`);

        // 🔥 FIX 2: Download Image with Timeout
        const response = await axios.get(fetchUrl, {
            responseType: 'arraybuffer',
            timeout: 15000 // 15 Seconds timeout (Slow internet handle karega)
        });

        const buffer = Buffer.from(response.data);

        // Decode JPEG
        const pixels = jpeg.decode(buffer, { useTArray: true });

        // Convert to Tensor
        const numChannels = 3;
        const numPixels = pixels.width * pixels.height;
        const values = new Int32Array(numPixels * numChannels);

        for (let i = 0; i < numPixels; i++) {
            for (let c = 0; c < numChannels; ++c) {
                values[i * numChannels + c] = pixels.data[i * 4 + c];
            }
        }

        const tensor = tf.tensor3d(values, [pixels.height, pixels.width, numChannels], 'int32');

        // Resize to 128x128 (Model requirement)
        const resized = tf.image.resizeBilinear(tensor, [128, 128]);
        const normalized = resized.div(255.0).expandDims(0);

        // Get Vector
        const prediction = model.predict(normalized);
        const vector = await prediction.data(); // Float32Array

        // Cleanup memory (Important for performance)
        tensor.dispose();
        resized.dispose();
        normalized.dispose();
        prediction.dispose();

        console.log("✅ Vector generated!");
        return Array.from(vector);

    } catch (error) {
        console.error("⚠️ AI Error (Skipping Vector):", error.message);
        return null; // Return null so Item saves without crashing
    }
};

module.exports = { getImageVector };