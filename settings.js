window.MUFFLER_ENABLED = "muffler-enabled";
window.BIQUAD_ENABLED = "biquad-enabled";
window.BIQUAD_TYPE = "biquad-type";
window.BIQUAD_Q = "biquad-q";
window.BIQUAD_FREQUENCY = "biquad-frequency";
window.BIQUAD_GAIN = "biquad-gain";

const DEFAULT_SETTINGS = {
  [MUFFLER_ENABLED]: false,
  [BIQUAD_ENABLED]: true,
  [BIQUAD_TYPE]: "lowpass",
  [BIQUAD_Q]: 1.5,
  [BIQUAD_FREQUENCY]: 500,
  [BIQUAD_GAIN]: 0,
};

const KEYS = Object.keys(DEFAULT_SETTINGS);

class Settings {
  #settings = undefined;
  #changeListeners = new Set();

  async init() {
    if (this.#settings !== undefined) {
      return;
    }

    const fromStorage = await browser.storage.sync.get(KEYS);
    const final = { ...DEFAULT_SETTINGS, ...fromStorage };
    if (Object.keys(fromStorage).length !== Object.keys(final).length) {
      await browser.storage.sync.set(final);
    }
    this.#settings = final;
  }

  get() {
    if (this.#settings === undefined) {
      throw new Error("Must call init first");
    }
    return this.#settings;
  }

  set(key, value) {
    if (this.#settings === undefined) {
      throw new Error("Must call init first");
    }

    if (!KEYS.includes(key)) {
      throw new Error(`Unexpected key ${key}`);
    }

    if (this.#settings[key] !== value) {
      this.#settings[key] = value;
      // Intentionally not awaiting.
      browser.storage.sync.set({ [key]: value });
    }
  }

  #internalListener = (changes) => {
    if (!this.#settings) return;

    let changedSettings = false;
    for (const [k, v] of Object.entries(changes)) {
      if (KEYS.includes(k) && this.#settings[k] !== v.newValue) {
        this.#settings[k] = v.newValue;
        changedSettings = true;
      }
    }

    if (changedSettings) {
      for (const cb of this.#changeListeners) {
        cb(this.#settings);
      }
    }
  };

  addOnChangeListener(cb) {
    if (this.#changeListeners.size === 0) {
      browser.storage.sync.onChanged.addListener(this.#internalListener);
    }

    this.#changeListeners.add(cb);
  }

  removeOnChangeListener(cb) {
    this.#changeListeners.remove(cb);

    if (this.#changeListeners.size === 0) {
      browser.storage.sync.onChanged.removeListener(this.#internalListener);
    }
  }

  hasOnChangeListener(cb) {
    return this.#changeListeners.has(cb);
  }
}

window.settings = new Settings();
