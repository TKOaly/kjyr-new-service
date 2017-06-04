const socket = new WebSocket('ws://' + window.location.hostname + ':8000/cabins');

socket.onopen = function () {
  console.log('Socket opened');
}

socket.onclose = function (e) {
  console.log('Closed: ' + e);
}

socket.onerror = function (e) {
  console.log(e);
}

socket.onmessage = function (e) {
  var data = JSON.parse(e.data);
  var box = document.getElementById(data.cabinId);
  switch (data.event) {
    case 'ADD': {
      if (box) {
        var tag = document.createElement('span');
        tag.className = 'tag is-success';
        tag.id = 'personTag' + data.person.reservationId;
        tag.innerText = data.person.firstname + ' ' + data.person.lastname;
        box.appendChild(tag);
        var emptyTag = document.getElementById('empty' + data.cabinId);
        if (emptyTag) {
          emptyTag.parentNode.removeChild(emptyTag);
        }
        if (box.getAttribute('persons')) {
          if ((Number(box.getAttribute('persons')) + 1) >= 4) {
            var radio = document.getElementById('radio' + data.cabinId);
            if (radio) {
              radio.setAttribute('disabled', '');
              box.setAttribute('persons', Number(box.getAttribute('persons')) + 1);
            }
          }
        }
      } 
      break;
    }
    case 'REMOVE': {
      var personTag = document.getElementById('personTag' + data.person.reservationId);
      if (personTag) {
        personTag.parentElement.removeChild(personTag);
      }
      if (box.getAttribute('persons')) {
        if ((Number(box.getAttribute('persons')) - 1) < 4) {
          var radio = document.getElementById('radio' + data.cabinId);
          if (radio) {
            radio.removeAttribute('disabled');
            box.setAttribute('persons', Number(box.getAttribute('persons')) - 1);
          }
        }
      }
      break;
    }
    case 'RESERVATION_COMPLETE': {
      var personTag = document.getElementById('personTag' + data.person.reservationId);
      if (personTag) {
        personTag.className = 'tag';
      }
      break;
    }
    case 'UPDATE': {
      var personTag = document.getElementById('personTag' + data.person.reservationId);
      if (personTag) {
        personTag.innerText = data.person.firstname + ' ' + data.person.lastname;
      }      
    }
  }
}