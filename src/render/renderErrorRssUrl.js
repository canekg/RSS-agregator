import _ from 'lodash';

const render = (message) => {
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  if (message) {
    input.classList.add('is-invalid');
    feedback.textContent = message;
  } else {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
  }
  input.focus();
  input.value = '';
};
export default render;
