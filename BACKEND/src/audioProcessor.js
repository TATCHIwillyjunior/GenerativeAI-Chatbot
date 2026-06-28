import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path || ffprobePath);

export function extractAudioFeatures(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return reject(err);

      const stream = data.streams.find((s) => s.codec_type === "audio");

      resolve({
        durationSeconds: data.format.duration || 0,
        sampleRate: stream?.sample_rate || null,
        channels: stream?.channels || null,
        loudness: "medium",
      });
    });
  });
}
