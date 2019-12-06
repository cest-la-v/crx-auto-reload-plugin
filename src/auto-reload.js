/* auto-reload start */
(function (chrome) {
  const INTERVAL = 2000;
  let lastModified = 0;

  async function readThisModified() {
    return new Promise((resolve) => {
      chrome.runtime.getPackageDirectoryEntry(function (rootDir) {
        rootDir.getFile('manifest.json', {}, function (fileEntry) {
          fileEntry.file(function (manifestFile) {
            resolve(manifestFile.lastModified)
          });
        })
      })
    })
  }

  function reloadIfRebuilt() {
    readThisModified()
      .then(thisModified => {
        if (lastModified === 0){
          lastModified = thisModified
        }
        if (lastModified < thisModified) {
          console.debug("Modified, reloading...");
          chrome.runtime.reload();
        } else {
          setTimeout(reloadIfRebuilt, INTERVAL);
        }
      });
  }

  reloadIfRebuilt();

})(chrome);
/* auto-reload end */
