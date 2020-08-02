const matches = [
  {
    name: 'Python 2 to Python 3',
    // 2.x to 3
    regexp: /(https?:\/\/docs.python.org\/)2(?:\.\d)?(\/.*)/,
    // 2.x and 3.x to 3
    // regexp: /(https?:\/\/docs.python.org\/)(?:2(?:\.\d)?|3\.\d)(\/.*)/,
    newSubStr: '$13$2'
  },
  {
    name: 'Java SE 8',
    regexp: /(https?:\/\/docs.oracle.com\/javase\/)(?:1.5.0|[67])(\/.*)/,
    newSubStr: '$18$2'
  },
  {
    name: 'PostgreSQL Current',
    regexp:
      /(https?:\/\/www.postgresql.org\/docs\/)(?:devel|\d+(?:\.\d+)?)(\/.*)/,
    newSubStr: '$1current$2'
  }
];

const STORAGE_NAME = 'matchData';
let cached = [];

function getMatchesData (callback) {
  chrome.storage.sync.get(STORAGE_NAME, items => {
    cached = items[STORAGE_NAME];
    callback(items[STORAGE_NAME]);
  });
}

function setMatchesData (callback) {
  const setVal = [];
  let obj = {};
  matches.forEach((elem, index, array) => {
    setVal.push({name: elem.name, enabled: true});
  });
  obj[STORAGE_NAME] = setVal;
  chrome.storage.sync.set(obj, () => {
    cached = setVal;
    if (callback) callback();
  });
}

function validateData (onFailure) {
  getMatchesData(matchData => {
    // some returns true if any iteration returns true
    const failed = !Array.isArray(matchData) ||
      matchData.length !== matches.length ||
      matchData.some((elem, index, array) => {
        return !(matches[index] &&
          elem.hasOwnProperty('enabled') && typeof elem.enabled === 'boolean' &&
          elem.hasOwnProperty('name') && elem.name === matches[index].name);
      });

    if (failed) onFailure();
  });
}

function getEnabledMatches () {
  const enabledMatches = [];
  cached.forEach((elem, index, array) => {
    if (elem.enabled) enabledMatches.push(matches[index]);
  });
  return enabledMatches;
}

validateData(setMatchesData);

chrome.storage.onChanged.addListener(object => {
  if (object.hasOwnProperty(STORAGE_NAME) &&
      object[STORAGE_NAME].hasOwnProperty('newValue')) {
    cached = object[STORAGE_NAME].newValue;
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  details => {
    let newUrl = details.url;
    const enabledMatches = getEnabledMatches();
    enabledMatches.forEach((elem, index, array) => {
      newUrl = newUrl.replace(elem.regexp, elem.newSubStr);
    });
    return newUrl === details.url ? {} : {redirectUrl: newUrl};
  },
  {
    urls: ['*://*/*'],
    types: ['main_frame']
  },
  ['blocking']
);
