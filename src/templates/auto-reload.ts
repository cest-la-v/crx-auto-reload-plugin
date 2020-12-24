/* auto-reload start */
(function (chrome) {

  const interval = parseInt('<%= interval %>');
  // @ts-ignore
  const openPopup = '<%= openPopup %>' === 'true';
  // @ts-ignore
  const openOptions = '<%= openOptions %>' === 'true';
  let lastModified = 0;

  function createTabIfNotExists(url: string) {
    chrome.tabs.query({url: url}, function (result: chrome.tabs.Tab[]) {
      if (result.length === 0) {
        chrome.tabs.create({url: url})
      }
    })
  }

  async function readBuildTimestamp(): Promise<number> {
    return new Promise((resolve) => {
      chrome.runtime.getPackageDirectoryEntry(rootDir => {
        rootDir.getFile('auto-reload.js', {}, function (fileEntry) {
          fileEntry.file(manifestFile => {
            resolve(manifestFile.lastModified)
          });
        })
      })
    })
  }

  function reloadIfRebuilt() {
    readBuildTimestamp()
      .then(thisModified => {
        if (lastModified === 0) {
          lastModified = thisModified
        }
        if (lastModified < thisModified) {
          console.debug("Modified, reloading...");
          chrome.runtime.reload();
        } else {
          setTimeout(reloadIfRebuilt, interval);
        }
      });
  }

  // create tabs
  const manifest = chrome.runtime.getManifest()
  const popupPage = manifest.browser_action?.default_popup;
  if (openPopup && popupPage) {
    createTabIfNotExists(chrome.runtime.getURL(popupPage))
  }
  const optionsPage = manifest.options_page;
  if (openOptions && optionsPage) {
    createTabIfNotExists(chrome.runtime.getURL(optionsPage))
  }

  // watch for changes
  reloadIfRebuilt();

})(chrome);
/* auto-reload end */
