import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import app from './app.js';
import resources from './locales/index.js';
import { each } from 'lodash';

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
        validationUrl: {
          isValid: null,
        },
      };
      return state;
    })
    .then((state) => {
      app(state);
    })
    .catch((e) => {
      throw new Error(e);
    });
};

func();
