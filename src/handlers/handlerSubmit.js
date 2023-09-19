import validate from '../validation/validate.js';
import watcher from '../view/watcher.js';

const form = document.querySelector('.rss-form');

const handlerOfBtnFormSection = (state, input) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = input.value;
    validate(state.i18n, url)
      .then((rssUrl) => {
        state.currentProcess = 'loadingRssContent';
        state.validationUrl.isValid = null;
        watcher(state).validationUrl.isValid = true;
        return rssUrl;
      })
      .catch((error) => {
        state.errorMessage = error.message;
        state.validationUrl.isValid = null;
        watcher(state).validationUrl.isValid = false;
      });
  });
};

export default handlerOfBtnFormSection;
