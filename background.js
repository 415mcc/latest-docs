var matches = {
  'Python 2 to Python 3': {
    // 2.x to 3
    regexp: /(https?:\/\/docs.python.org\/)2(?:\.\d)?(\/.*)/,
    // 2.x and 2.x to 3
    // regexp: /(https?:\/\/docs.python.org\/)(?:2(?:\.\d)?|3\.\d)(\/.*)/,
    newSubStr: '$13$2'
  },
  'Java SE 8': {
    regexp: /(https?:\/\/docs.oracle.com\/javase\/)(?:1.5.0|[67])(\/.*)/,
    newSubStr: '$18$2'
  }
};

for (matchName in matches) {
  matches[matchName].enabled = true;
}

chrome.storage.sync.get(Object.keys(matches),
  function(items) {
    for (matchName in matches) {
      if (items[matchName] != undefined) {
        matches[matchName].enabled = items[matchName];
      }
    }
  });

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    var newUrl = details.url;
    for (var matchName in matches) {
      if (matches[matchName].enabled)
        newUrl = newUrl.replace(matches[matchName].regexp,
                    matches[matchName].newSubStr);
    }
    return newUrl == details.url ? {} : {redirectUrl: newUrl};
  },
  {
    urls: ['*://*/*'],
    types: ['main_frame']
  },
  ['blocking']
);

function changeStatus(name) {
  for (matchName in matches) {
    if (matchName == name) {
      matches[matchName].enabled = !matches[matchName].enabled;
      chrome.storage.sync.set({matchName: matches[matchName.enabled]});
      break;
    }
  }
}

function getStatus(name) {
  for (matchName in matches) {
    if (matchName == name) {
      return matches[matchName].enabled;
    }
  }
  return false;
}

function getNames() {
  return Object.keys(matches);
}
