export const initFiles = (handleFile) => { 
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
  dropArea.addEventListener('change', (e) => handleFiles(e.target.files))

  function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files

    handleFiles(files)
  }

  function handleFiles(files) {
    if (!files) return
    const arr = [...files]
    arr.forEach(handleFile)
  }
}