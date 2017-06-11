var activeForm = document.getElementById('form1');
activeForm.style.display = 'inline';
var activeDeleteForm = document.getElementById('deleteForm1');
activeDeleteForm.style.display = 'inline';

function showForm(personId) {
  var form = document.getElementById('form' + personId);
  var deleteForm = document.getElementById('deleteForm' + personId);
  if (form && deleteForm) {
    if (activeForm && activeDeleteForm) {
      activeForm.style.display = 'none';
      activeDeleteForm.style.display = 'none';
    }
    form.style.display = 'inline';
    deleteForm.style.display = 'inline';
    activeDeleteForm = deleteForm;
    activeForm = form;
  }
}
