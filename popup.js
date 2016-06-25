var DISABLE = 'Disable'
var ENABLE = 'Enable'

function changeStatus(background, names, button) {
  button.innerHTML = button.innerHTML == DISABLE ? ENABLE : DISABLE;
  background.changeStatus(names[button.id.substring(1)]);
}

document.addEventListener('DOMContentLoaded', function() {
  var background = chrome.extension.getBackgroundPage();
  var names = background.getNames().sort();
  var parent = document.getElementById('switchboard');

  for (nameindex in names) {
    console.log(nameindex);
    var name = names[nameindex];
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(name + ':'));

    var button = document.createElement('button');
    var status = background.getStatus(name);
    button.innerHTML = status ? DISABLE : ENABLE;
    button.id = 'b' + nameindex;
    button.addEventListener('click', function() {
      changeStatus(background, names, this);
    });
    div.appendChild(button);

    parent.appendChild(div);
  }
});
