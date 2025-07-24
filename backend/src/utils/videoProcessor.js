const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { uploadFileBufferToCloudinary } = require('./cloudinary');

ffmpeg.setFfmpegPath(ffmpegPath);

const resolutions = {
  '360p': { width: 640, height: 360 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
};

const transcodeToResolutions = async (buffer) => {
  const outputs = {};

  for (const [label, { width, height }] of Object.entries(resolutions)) {
    const tempPath = path.join(__dirname, `../../temp-${label}.mp4`);

    await new Promise((resolve, reject) => {
      ffmpeg(buffer)
        .output(tempPath)
        .videoCodec('libx264')
        .size(`${width}x${height}`)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    const fileBuffer = fs.readFileSync(tempPath);
    const result = await uploadFileBufferToCloudinary(fileBuffer, `videos/${label}`);
    fs.unlinkSync(tempPath);

    outputs[label] = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  return outputs;
};

module.exports = { transcodeToResolutions };
