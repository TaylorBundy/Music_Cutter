async function procesar() {
  const file = document.getElementById("file").files[0];
  if (!file) return alert("Cargá un audio");

  let start = Number(document.getElementById("start").value);
  let end = Number(document.getElementById("end").value);
  const fadeIn = Number(document.getElementById("fadeIn").value);
  const fadeOut = Number(document.getElementById("fadeOut").value);
  const format = document.getElementById("format").value;

  const ctx = new AudioContext();

  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const duration = audioBuffer.duration;

  // valores automáticos
  if (!start) {
    start = 0;
    document.getElementById("start").value = start;
  }
  if (!end) {
    end = duration;
    document.getElementById("end").value = end;
  }

  const sampleRate = audioBuffer.sampleRate;

  const startSample = start * sampleRate;
  const endSample = end * sampleRate;

  const length = endSample - startSample;

  const newBuffer = ctx.createBuffer(
    audioBuffer.numberOfChannels,
    length,
    sampleRate,
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const oldData = audioBuffer.getChannelData(channel);
    const newData = newBuffer.getChannelData(channel);

    for (let i = 0; i < length; i++) {
      let volume = 1;
      let time = i / sampleRate;

      if (time < fadeIn) {
        volume = time / fadeIn;
      }

      if (time > end - start - fadeOut) {
        volume = (end - start - time) / fadeOut;
      }

      newData[i] = oldData[i + startSample] * volume;
    }
  }

  const wav = bufferToWave(newBuffer);

  const blob = new Blob([wav], { type: "audio/wav" });

  const url = URL.createObjectURL(blob);

  const link = document.getElementById("download");
  link.href = url;
  //link.download = "audio_editado.wav"
  link.download = "audio_editado." + format;
  link.innerText = "Descargar audio";
}

function bufferToWave(abuffer) {
  let numOfChan = abuffer.numberOfChannels;
  let length = abuffer.length * numOfChan * 2 + 44;
  let buffer = new ArrayBuffer(length);
  let view = new DataView(buffer);

  let channels = [];
  let offset = 0;
  let pos = 0;

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);

  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);

  setUint32(0x61746164);
  setUint32(length - pos - 4);

  for (let i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return buffer;
}

function activarTitulos() {
  document.addEventListener("mousemove", (e) => {
    const el = e.target.closest("[data-title],[title]");

    if (!el) return;

    if (el.dataset.title) {
      el.title = el.dataset.title;
    }
  });
}

activarTitulos();

// const fileInput =
//   document.getElementById("file") || document.getElementById("file1");
// const nombre =
//   document.getElementById("nombreArchivo") ||
//   document.getElementById("nombreArchivo1");

// fileInput.addEventListener("change", () => {
//   if (fileInput.files.length > 0) {
//     nombre.textContent = fileInput.files[0].name;
//   }
// });

document.querySelectorAll("#file").forEach((input) => {
  input.addEventListener("change", function () {
    const box = this.closest(".agregar_archivo");
    const name = box.querySelector("#nombreArchivo");

    if (this.files.length > 0) {
      name.textContent = this.files[0].name;
    }
  });
});
