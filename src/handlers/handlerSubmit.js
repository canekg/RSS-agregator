/* eslint-disable no-param-reassign */
import validate from '../validation/validate.js';
import watcher from '../view/watcher.js';

const form = document.querySelector('.rss-form');

const handlerOfBtnFormSection = (state, input) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = input.value;
    validate(state.i18n, url)
      .then((rssUrl) => {
        const urls = state.validUrls;
        if (urls.includes(rssUrl)) {
          throw new Error(state.i18n.t('validation.errors.errorUniqUrl'));
        }
        return rssUrl;
      })
      .then((rssUrl) => {
        state.currentProcess = 'loadingRssContent';
        state.isValid = null;
        watcher(state).isValid = true;
        state.validUrls.push(rssUrl);
        return rssUrl;
      })
      .catch((error) => {
        state.errorMessage = error.message;
        state.isValid = null;
        watcher(state).isValid = false;
      });
  });
};

export default handlerOfBtnFormSection;
