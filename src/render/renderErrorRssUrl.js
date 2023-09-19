const render = (message, isValid) => {
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  if (isValid) {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
  } else {
    input.classList.add('is-invalid');
    feedback.textContent = message;
  }
  input.focus();
  input.value = '';
};
export default render;
