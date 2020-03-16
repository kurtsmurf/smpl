import { initFiles } from './files.js'
initFiles(handleFile)


const audioContext = new AudioContext()
const audioBuffers = []
const out = audioContext.createGain()
const comp = audioContext.createDynamicsCompressor()
const analyser = audioContext.createAnalyser()
out.connect(comp).connect(analyser).connect(audioContext.destination)

let selectedFile;

const selectFile = (index) => {
  if (selectedFile !== undefined) {
    const prevSelected = document.getElementById(selectedFile)
    prevSelected.classList.remove('selected')
  }

  selectedFile = index

  const nextSelected = document.getElementById(selectedFile)
  nextSelected.classList.add('selected')
}

const fileRepresentation = (fileName, index) => {
  const root = document.createElement('div')
  root.classList.add('file')
  root.id = index
  root.tabIndex = 0;
  root.addEventListener('click', () => selectFile(index))
  root.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { selectFile(index) }
  })

  const icon = document.createElement('img')
  icon.classList.add('file-icon')
  icon.src = 'images/sound-file.svg'

  const label = document.createElement('span')
  label.classList.add('file-label')
  label.innerText = fileName

  icon.addEventListener('click', (e) => e.preventDefault())
  label.addEventListener('click', (e) => e.preventDefault())

  root.appendChild(icon)
  root.appendChild(label)

  return root
}

function handleFile(file) {
  let reader = new FileReader()
  reader.onloadend = (e) => {
    let arrayBuffer = e.target.result
    audioContext.decodeAudioData(arrayBuffer)
      .then(audioBuffer => {
        audioBuffers.push(audioBuffer)
        const index = audioBuffers.length - 1
        const visualFile = fileRepresentation(file.name, index)
        document.querySelector('.desktop').appendChild(visualFile)
      })
  }
  reader.readAsArrayBuffer(file)
}

import { playableKeys } from './playableKeys.js'

const getBufSrc = (audioBuffer) => {
  const sourceNode = audioContext.createBufferSource()
  sourceNode.buffer = audioBuffer

  const stereoPanner = audioContext.createStereoPanner()
  stereoPanner.pan.value = Math.random() * 2 - 1

  sourceNode.connect(stereoPanner).connect(out)
  return sourceNode
}

const noteIndex = (char, rowOffset = 3) => {
  const playableKey = playableKeys[char]
  if (!playableKey) return
  return playableKey.index + playableKey.row * rowOffset
}

let tones = {}
let retriggerIsAllowed = false

const handleKeyDown = (e) => {
  if (!playableKeys[e.key]) return
  if (tones[e.key] && !retriggerIsAllowed) return

  const playbackRate = Math.pow(2, noteIndex(e.key) / 12)
  const tone = getBufSrc(audioBuffers[selectedFile])
  tone.playbackRate.value = playbackRate
  tone.loop = true
  tone.start()

  tones[e.key] = tones[e.key] || []
  tones[e.key].push(tone)
}

const handleKeyUp = (e) => {
  if (!playableKeys[e.key]) return

  tones[e.key].forEach(tone => {
    tone.stop()
  })

  tones[e.key] = null
}

document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

// todo: toggle allow re-trigger
// todo: toggle randomize panning
// todo: toggle loop