import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import resources from './locales/index.js';
import watcherValidationURL from './view/watcher.js';
import handlerOfBtnFormSection from './handlers/handlerSubmit.js';

const func = () => {
  const promise = new Promise((resolve) => {
    const i18Instance = i18next.createInstance();
    i18Instance.init({
      lng: 'ru',
      debug: true,
      resources,
    });
    resolve(i18Instance);
  });

  promise
    .then((i18nInst) => {
      const state = {
        i18n: i18nInst,
        errorMessage: null,
        currentProcess: 'filling', // fillingRssUrl, loadingRssContent
        isValid: null,
        validUrls: [],
      };
      return state;
    })
    .then((state) => {
      const input = document.querySelector('#url-input');
      watcherValidationURL(state);
      handlerOfBtnFormSection(state, input);
    })
    .catch((e) => {
      throw new Error(e);
    });
};

func();
