import './styles.scss';
import 'bootstrap';
import i18next from 'i18next';
import resources from './locales/index.js';
import handler from './handlers/handler.js';

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
        currentProcess: null, // 'loadingRssContent, loadedRssContent'
        isValid: null,
        validUrls: [],
        content: {
          posts: [],
          feeds: [],
        },
        uiState: {
          visitedLinksIds: new Set(),
          modalId: '',
        },
      };
      return state;
    })
    .then((state) => {
      handler(state);
    })
    .catch((e) => {
      throw new Error(e);
    });
};

func();
