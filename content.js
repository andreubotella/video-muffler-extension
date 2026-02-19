let audioCtx;
let filter;
let tracks = new Map(); /* Map<HTMLMediaElement, MediaElementAudioSourceNode> */

async function setupFilters() {
  // Dummy pass-through nodes to serve as the input and output to our filter
  // chain, so we can hot swap the internals of the chain without needing to
  // reconnect every input.
  filter = new GainNode(audioCtx);

  const biquad = new BiquadFilterNode(audioCtx);

  const updateFilters = (settingsObj) => {
    if (settingsObj[MUFFLER_ENABLED] && settingsObj[BIQUAD_ENABLED]) {
      biquad.type = settingsObj[BIQUAD_TYPE];
      biquad.Q.value = settingsObj[BIQUAD_Q];
      biquad.frequency.value = settingsObj[BIQUAD_FREQUENCY];
      biquad.gain.value = settingsObj[BIQUAD_GAIN];
    }

    filter.disconnect();
    biquad.disconnect();
    if (settingsObj[MUFFLER_ENABLED] && settingsObj[BIQUAD_ENABLED]) {
      filter.connect(biquad).connect(audioCtx.destination);
    } else {
      filter.connect(audioCtx.destination);
    }
  };

  settings.addOnChangeListener(updateFilters);

  await settings.init();
  updateFilters(settings.get());
}

async function initMedia(el) {
  if (tracks.has(el)) return;

  if (!audioCtx) {
    audioCtx = new AudioContext();
    await setupFilters();
  }

  // TODO: If `el` gets removed from the document and there are no remaining
  // references to it in the DOM, this would still prevent it from being GC'd.
  const track = new MediaElementAudioSourceNode(audioCtx, { mediaElement: el });
  track.connect(filter);
  tracks.set(el, track);
}

// TODO: Can we instead detect when such an element is inserted, rather than
// polling?
function matchMedia() {
  document.querySelectorAll("audio, video").forEach(initMedia);
}

matchMedia();
setInterval(matchMedia, 1000);
