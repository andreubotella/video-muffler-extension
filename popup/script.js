const mufflerEnabled = document.getElementById(MUFFLER_ENABLED);
const biquadEnabled = document.getElementById(BIQUAD_ENABLED);
const biquadType = document.getElementById(BIQUAD_TYPE);
const biquadQ = document.getElementById(BIQUAD_Q);
const biquadFrequency = document.getElementById(BIQUAD_FREQUENCY);
const biquadGain = document.getElementById(BIQUAD_GAIN);

const fields = [
  { key: MUFFLER_ENABLED, el: mufflerEnabled, attr: "checked" },
  { key: BIQUAD_ENABLED, el: biquadEnabled, attr: "checked" },
  // TODO: Is `value` correct for setting it?
  { key: BIQUAD_TYPE, el: biquadType, attr: "value" },
  { key: BIQUAD_Q, el: biquadQ, attr: "valueAsNumber" },
  { key: BIQUAD_FREQUENCY, el: biquadFrequency, attr: "valueAsNumber" },
  { key: BIQUAD_GAIN, el: biquadGain, attr: "valueAsNumber" },
];

function updateFromSettings(settingsObj) {
  for (const fieldData of fields) {
    fieldData.el[fieldData.attr] = settingsObj[fieldData.key];
  }
  updateDisabled(settingsObj);
}

function updateDisabled(settingsObj) {
  document.getElementById("muffler-fieldset").disabled =
    !settingsObj[MUFFLER_ENABLED];
  document.getElementById("biquad-fieldset").disabled =
    !settingsObj[BIQUAD_ENABLED];
  biquadQ.disabled = ["lowshelf", "highshelf"].includes(
    settingsObj[BIQUAD_TYPE],
  );
  biquadGain.disabled = [
    "lowpass",
    "highpass",
    "bandpass",
    "notch",
    "allpass",
  ].includes(settingsObj[BIQUAD_TYPE]);
}

function updateField(fieldData, newValue) {
  settings.set(fieldData.key, newValue);
  updateDisabled(settings.get());
}

for (const fieldData of fields) {
  const { el } = fieldData;
  // TODO: input event?
  el.addEventListener("change", (evt) => {
    console.log(el[fieldData.attr], evt);
    updateField(fieldData, el[fieldData.attr]);
  });
}

// Init
(async () => {
  settings.addOnChangeListener(updateFromSettings);

  await settings.init();
  updateFromSettings(settings.get());

  document.body.classList.remove("is-loading");
})();
