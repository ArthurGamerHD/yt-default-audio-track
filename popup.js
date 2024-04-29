const audioTrackButtonTitleInput = document.getElementById(
  "audio-track-button-title"
);
const selectAudioTrackInput = document.getElementById("select-audio-track");

let beforeChangeStorage;

const save = () => {
  console.log("save");
  const newStorage = {
    audioTrackButtonTitle: audioTrackButtonTitleInput.value,
    selectTrackTitle: selectAudioTrackInput.value,
  };
  chrome.storage.sync.set(newStorage);

  beforeChangeStorage = { ...newStorage };
};

const cancel = () => {
  if (!beforeChangeStorage) {
    return;
  }
  audioTrackButtonTitleInput.value = beforeChangeStorage.audioTrackButtonTitle;
  selectAudioTrackInput.value = beforeChangeStorage.selectTrackTitle;
};

const reset = () => {
  const defaultStorage = {
    audioTrackButtonTitle: "Audio track",
    selectTrackTitle: "original",
  };
  chrome.storage.sync.set(defaultStorage);

  audioTrackButtonTitleInput.value = defaultStorage.audioTrackButtonTitle;
  selectAudioTrackInput.value = defaultStorage.selectTrackTitle;
  beforeChangeStorage = { ...defaultStorage };
};

const initialize = async () => {
  const {
    audioTrackButtonTitle = "Audio track",
    selectTrackTitle = "original",
  } = await chrome.storage.sync.get(["audioTrackButtonTitle", "selectTrackTitle"]);
  beforeChangeStorage = {
    audioTrackButtonTitle,
    selectTrackTitle,
  };
  audioTrackButtonTitleInput.value = audioTrackButtonTitle;
  selectAudioTrackInput.value = selectTrackTitle;

  document.getElementById("save").addEventListener("click", save);
  document.getElementById("cancel").addEventListener("click", cancel);
  document.getElementById("reset").addEventListener("click", reset);
};

initialize();
