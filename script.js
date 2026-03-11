const { createFFmpeg, fetchFile } = FFmpeg

const ffmpeg = createFFmpeg({
log:true
})

async function procesar(){

const file = document.getElementById("file").files[0]
if(!file) return alert("Seleccioná un audio")

const start = document.getElementById("start").value
const end = document.getElementById("end").value
const fadeIn = document.getElementById("fadeIn").value
const fadeOut = document.getElementById("fadeOut").value
const format = document.getElementById("format").value

if(!ffmpeg.isLoaded()){
await ffmpeg.load()
}

ffmpeg.FS("writeFile","input",await fetchFile(file))

await ffmpeg.run(
"-i","input",
"-ss",start,
"-to",end,
"-af",`afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${end-fadeOut}:d=${fadeOut}`,
`output.${format}`
)

const data = ffmpeg.FS("readFile",`output.${format}`)

const url = URL.createObjectURL(
new Blob([data.buffer])
)

const link = document.getElementById("download")

link.href = url
link.download = "audio_editado."+format
link.innerText = "Descargar audio"

}