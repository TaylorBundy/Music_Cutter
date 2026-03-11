const fileInput = document.getElementById("fileInput");
const convertBtn = document.getElementById("convertBtn");
const downloadLink = document.getElementById("downloadLink");
const statusText = document.getElementById("status");

convertBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];

  if (!file) {
    statusText.innerText = "Selecciona un archivo WAV";
    return;
  }

  statusText.innerText = "Procesando...";

  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const samples = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);

  const sampleBlockSize = 1152;
  let mp3Data = [];

  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const sampleChunk = samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(convertFloat32ToInt16(sampleChunk));

    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }

  const mp3buf = mp3encoder.flush();

  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  const blob = new Blob(mp3Data, { type: "audio/mp3" });

  const url = URL.createObjectURL(blob);

  downloadLink.href = url;
  downloadLink.download = "audio_convertido.mp3";
  downloadLink.style.display = "block";

  statusText.innerText = "Conversión completa";
});

function convertFloat32ToInt16(buffer) {
  let l = buffer.length;
  let buf = new Int16Array(l);

  while (l--) {
    buf[l] = Math.min(1, buffer[l]) * 0x7fff;
  }

  return buf;
}
