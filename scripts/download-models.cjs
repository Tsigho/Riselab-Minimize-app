const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsDir = path.join(__dirname, '../public/models');
const baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";

const files = [
    "ssd_mobilenet_v1_model-weights_manifest.json",
    "ssd_mobilenet_v1_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
];

if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const downloadFile = (file) => {
    const filePath = path.join(modelsDir, file);
    const fileUrl = `${baseUrl}/${file}`;

    console.log(`Downloading ${file}...`);

    const fileStream = fs.createWriteStream(filePath);
    https.get(fileUrl, (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Saved ${file}`);
        });
    }).on('error', (err) => {
        fs.unlink(filePath, () => { }); // Delete the file async. (But we don't check the result)
        console.error(`Error downloading ${file}: ${err.message}`);
    });
};

files.forEach(downloadFile);
