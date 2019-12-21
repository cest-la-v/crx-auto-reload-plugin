/* auto-reload start */
(function (chrome) {
  const interval = parseInt('<%= interval %>');
  // @ts-ignore
  const openPopup = '<%= openPopup %>' === 'true';
  // @ts-ignore
  const openOptions = '<%= openOptions %>' === 'true';
  let lastModified = 0;

  // create tabs
  let manifest = chrome.runtime.getManifest()
  let defaultPopup = manifest.browser_action?.default_popup;
  if (openPopup && defaultPopup) {
    chrome.tabs.create({url: chrome.runtime.getURL(defaultPopup)})
  }
  let optionsPage = manifest.options_page;
  if (openOptions && optionsPage) {
    chrome.tabs.create({url: chrome.runtime.getURL(optionsPage)})
  }

  // watch for changes
  async function readThisModified(): Promise<number> {
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
    readThisModified()
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

  reloadIfRebuilt();

})(chrome);
/* auto-reload end */
