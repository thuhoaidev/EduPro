const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');
const path = require('path');

const resolutions = [
  { name: '360p', width: 640, height: 360 },
  { name: '720p', width: 1280, height: 720 },
  { name: '1080p', width: 1920, height: 1080 }
];

const convertVideo = async (buffer, fileNameNoExt, uploadDir) => {
  const tempPath = path.join(uploadDir, `${fileNameNoExt}-original.mp4`);
  await fs.writeFile(tempPath, buffer);

  const outputs = [];

  for (const res of resolutions) {
    const outputPath = path.join(uploadDir, `${fileNameNoExt}-${res.name}.mp4`);
    await new Promise((resolve, reject) => {
      ffmpeg(tempPath)
        .videoCodec('libx264')
        .size(`${res.width}x${res.height}`)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', reject)
        .run();
    });
    outputs.push({ quality: res.name, url: `/uploads/videos/${fileNameNoExt}-${res.name}.mp4` });
  }

  await fs.remove(tempPath); // Xoá bản gốc
  return outputs;
};

module.exports = { convertVideo };
