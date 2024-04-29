const getVideoEl = () => document.querySelector("video.html5-main-video");
const getSettingIconEl = () =>
  document.querySelector(
    "#movie_player > div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-right-controls > button.ytp-button.ytp-settings-button"
  );
const getAudioTrackButton = (audioTrackButtonTitle) => {
  const nodeList = document.querySelectorAll(
    "div.ytp-settings-menu > div.ytp-panel > div > div .ytp-menuitem-label span:first-child"
  );
  const innerAudioTrackButton = [...nodeList].find((node) =>
    node.innerHTML.includes(audioTrackButtonTitle)
  );
  return innerAudioTrackButton?.parentElement.parentElement;
};

let stopCounter = 0;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let vid = getVideoEl();
let lastTitle = "";
let changed = false;

if (vid && !vid.paused) {
  vid = getVideoEl();

  const changeLanguage = async () => {
    if (changed) {
      return;
    }
    changed = true
    stopCounter = 0;
    while (stopCounter < 250 && vid.readyState !== vid.HAVE_ENOUGH_DATA) {
      await sleep(50);
      stopCounter++;
    }
    if (stopCounter === 250) {
      console.log("[YTDAT] Fail to detect Video");
      return;
    }
    const {
      audioTrackButtonTitle = "Audio track",
      selectTrackTitle = "original",
    } = await chrome.storage.sync.get([
      "audioTrackButtonTitle",
      "selectTrackTitle",
    ]);

    getSettingIconEl().click();
    getSettingIconEl().click();
    stopCounter = 0;
    while (stopCounter < 250 && !getAudioTrackButton(audioTrackButtonTitle)) {
      await sleep(50);
      stopCounter++;
    }
    if (stopCounter === 250) {
      console.log("[YTDAT] No Audio Track");
      return;
    }

    getAudioTrackButton(audioTrackButtonTitle).click();

    let nl = document.querySelectorAll(
      "div.ytp-panel > div.ytp-panel-menu > div"
    );

    if (!nl.length) {
      console.log("[YTDAT] No Audio Tracks found, skip!");
      return;
    }
    let allEl = [...nl].map((el) => el.firstChild.firstChild.data);

    let oriIndex = allEl.findIndex((text) =>
      text.toLowerCase().includes(selectTrackTitle)
    );

    stopCounter = 0;
    while (stopCounter < 200 && oriIndex === -1) {
      await sleep(50);
      allEl = [...nl].map((el) => el.firstChild.firstChild.data);
      oriIndex = allEl.findIndex((text) =>
        text.toLowerCase().includes(selectTrackTitle)
      );
      stopCounter++;
    }

    if (oriIndex === -1) {
      console.log(
        `[YTDAT] Audio Track include \x1B[94m${selectTrackTitle}\x1B[m not found!`
      );
      return;
    }

    nl[oriIndex]?.click();
    console.info(`[YTDAT] Change Audio Track to \x1B[94m${allEl[oriIndex]}`);
  };

  window.addEventListener(
    "yt-update-title",
    (e) => {
      if (e.detail?.length && e.detail !== lastTitle) {
        changeLanguage();
        lastTitle = e.detail;
      }
    },
    true
  );

  const observer = new MutationObserver(async (mutations, observer) => {
    const tagNames = mutations.map((mutation) => mutation.target.tagName);
    if (tagNames.includes("ytd-watch-flexy".toUpperCase())) {
      changeLanguage();
      observer.disconnect();
    }
  });
  observer.observe(document, {
    subtree: true,
    childList: true,
  });
  if (document.querySelector("ytd-watch-flexy")) {
    changeLanguage();
    observer.disconnect();
  }
}
