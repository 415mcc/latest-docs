// assumes, for the most part, that event page has setup storage correctly
// popup does very little data validation

const STORAGE_NAME = 'matchData';

function getMatchesData (callback) {
  chrome.storage.sync.get(STORAGE_NAME, items => {
    callback(items[STORAGE_NAME]);
  });
}

function setMatchesData (data, callback) {
  let obj = {};
  obj[STORAGE_NAME] = data;
  chrome.storage.sync.set(obj, () => {
    if (callback) callback();
  });
}

function switchStatus (index, callback) {
  getMatchesData(matchData => {
    matchData[index].enabled = !matchData[index].enabled;
    setMatchesData(matchData, callback);
  });
}

function addCheckbox (parent, index, name, enabled) {
  let input = document.createElement('input');
  input.id = 'match' + index;
  input.type = 'checkbox';
  input.checked = enabled;
  input.addEventListener('change', () => {
    switchStatus(index);
  });
  parent.appendChild(input);

  let label = document.createElement('label');
  label.setAttribute('for', 'match' + index);
  label.appendChild(document.createTextNode(name + '\n'));
  parent.appendChild(label);
}

function createCheckboxes () {
  getMatchesData(matchData => {
    let parent = document.getElementById('switchboard');
    matchData.forEach((elem, index, array) => {
      addCheckbox(parent, index, elem.name, elem.enabled);
    });
  });
}

createCheckboxes();
document.activeElement.blur();
