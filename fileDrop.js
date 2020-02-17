const dropArea = document.getElementById('drop-area')

  ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
  })

function preventDefaults(e) {
  e.preventDefault()
  e.stopPropagation()
}

;['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false)
})

;['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false)
})

function highlight(e) {
  dropArea.classList.add('highlight')
}

function unhighlight(e) {
  dropArea.classList.remove('highlight')
}

dropArea.addEventListener('drop', handleDrop, false)

function handleDrop(e) {
  let dt = e.dataTransfer
  let files = dt.files

  handleFiles(files)
}

function handleFiles(files) {
  arr = [...files]
  arr.forEach(handleFile)
}

const audioContext = new AudioContext()
const audioBuffers = []
const out = audioContext.createGain()
const comp = audioContext.createDynamicsCompressor()
const analyser = audioContext.createAnalyser()
out.connect(comp).connect(analyser).connect(audioContext.destination)

function handleFile(file) {
  let reader = new FileReader()
  reader.onloadend = (e) => {
    let arrayBuffer = e.target.result
    audioContext.decodeAudioData(arrayBuffer)
      .then(audioBuffer => {
        audioBuffers.push(audioBuffer)
      })
  }
  reader.readAsArrayBuffer(file)
}
