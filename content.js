let audioCtx;
let filter;
let tracks = new Map(); /* Map<HTMLMediaElement, MediaElementAudioSourceNode> */

function initMedia(el) {
  if (tracks.has(el)) return;

  if (!audioCtx) {
    audioCtx = new AudioContext();

    //const convolver = new ConvolverNode(audioCtx, {});
    const biquad = new BiquadFilterNode(audioCtx, {
      type: "lowpass",
      frequency: 500,
      Q: 1.5,
    });

    filter = biquad;
    biquad.connect(audioCtx.destination);
  }

  // TODO: If `el` gets removed from the document and there are no remaining
  // references to it in the DOM, this would still prevent it from being GC'd.
  const track = new MediaElementAudioSourceNode(audioCtx, { mediaElement: el });
  track.connect(filter);
  tracks.insert(el, track);
}

// TODO: Can we instead detect when such an element is inserted, rather than
// polling?
function matchMedia() {
  document.querySelectorAll("audio, video").forEach(initMedia);
}

matchMedia();
setInterval(matchMedia, 1000);
