var activeForm = document.getElementById('form1');
activeForm.style.display = 'inline';

function showForm(personId) {
  var form = document.getElementById('form' + personId);
  if (form) {
    if (activeForm) 
      activeForm.style.display = 'none';
    form.style.display = 'inline';
    activeForm = form;
  }
}
