const fileElem = document.getElementById('fileElem')
fileElem.addEventListener('change', (e) => handleFiles(e.target.files))
document.querySelector('label[for="fileElem"]').addEventListener('keypress', e => ['Space', 'Enter'].includes(e.code) && fileElem.click());

function handleFiles(files) {
  arr = [...files]
  arr.forEach(handleFile)
}

let tuningSemitones = 0
const tuningSemisInput = document.getElementById('tuning-semitones')
tuningSemisInput.addEventListener('change', e => tuningSemitones = parseInt(e.target.value))

let tuningCents = 0
const tuningCentsInput = document.getElementById('tuning-cents')
tuningCentsInput.addEventListener('change', e => tuningCents = parseInt(e.target.value))

let tonesPerOctave = 12
const tonesPerOctInput = document.getElementById('tones-per-octave')
tonesPerOctInput.addEventListener('change', e => tonesPerOctave = parseInt(e.target.value))



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
    if (e.key === 'Enter' || e.key === ' ') { selectFile(index) }
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

const playableKeys = {
  "0": { "index": 9, "row": 3 },
  "1": { "index": 0, "row": 3 },
  "2": { "index": 1, "row": 3 },
  "3": { "index": 2, "row": 3 },
  "4": { "index": 3, "row": 3 },
  "5": { "index": 4, "row": 3 },
  "6": { "index": 5, "row": 3 },
  "7": { "index": 6, "row": 3 },
  "8": { "index": 7, "row": 3 },
  "9": { "index": 8, "row": 3 },
  "z": { "index": 0, "row": 0 },
  "x": { "index": 1, "row": 0 },
  "c": { "index": 2, "row": 0 },
  "v": { "index": 3, "row": 0 },
  "b": { "index": 4, "row": 0 },
  "n": { "index": 5, "row": 0 },
  "m": { "index": 6, "row": 0 },
  ",": { "index": 7, "row": 0 },
  ".": { "index": 8, "row": 0 },
  "/": { "index": 9, "row": 0 },
  "a": { "index": 0, "row": 1 },
  "s": { "index": 1, "row": 1 },
  "d": { "index": 2, "row": 1 },
  "f": { "index": 3, "row": 1 },
  "g": { "index": 4, "row": 1 },
  "h": { "index": 5, "row": 1 },
  "j": { "index": 6, "row": 1 },
  "k": { "index": 7, "row": 1 },
  "l": { "index": 8, "row": 1 },
  ";": { "index": 9, "row": 1 },
  "'": { "index": 10, "row": 1 },
  "q": { "index": 0, "row": 2 },
  "w": { "index": 1, "row": 2 },
  "e": { "index": 2, "row": 2 },
  "r": { "index": 3, "row": 2 },
  "t": { "index": 4, "row": 2 },
  "y": { "index": 5, "row": 2 },
  "u": { "index": 6, "row": 2 },
  "i": { "index": 7, "row": 2 },
  "o": { "index": 8, "row": 2 },
  "p": { "index": 9, "row": 2 },
  "[": { "index": 10, "row": 2 },
  "]": { "index": 11, "row": 2 },
  "-": { "index": 10, "row": 3 },
  "=": { "index": 11, "row": 3 }
}

const getBufSrc = (audioBuffer) => {
  const sourceNode = audioContext.createBufferSource()
  sourceNode.buffer = audioBuffer

  const stereoPanner = audioContext.createStereoPanner()
  stereoPanner.pan.value = Math.random() * 2 - 1

  const gain = audioContext.createGain()

  sourceNode.connect(stereoPanner).connect(gain).connect(out)

  const tone = {
    source: sourceNode,
    stop: () => {
      const release = .2
      gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + release)
      setTimeout(() => sourceNode.stop(), release * 1000 + 100)
    }    
  }
  return tone
}

const noteIndex = (char) => {
  const rowOffset = 3
  const playableKey = playableKeys[char]
  if (!playableKey) return
  return playableKey.index + playableKey.row * rowOffset + tuningSemitones + tuningCents / 100
}

let tones = {}
let retriggerIsAllowed = false


const handleKeyDown = (e) => {
  if (!playableKeys[e.key]) return
  if (tones[e.key] && !retriggerIsAllowed) return

  const playbackRate = Math.pow(2, noteIndex(e.key) / tonesPerOctave)
  const tone = getBufSrc(audioBuffers[selectedFile])
  tone.source.playbackRate.value = playbackRate
  tone.source.loop = true
  tone.source.start()

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
