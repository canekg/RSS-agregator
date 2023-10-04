/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import * as yup from 'yup';
import { setLocale } from 'yup';
import resources from './locales/index.js';
import render from './render/render.js';
import parserRss from './parsers/parserRss.js';

const form = document.querySelector('.rss-form');
const input = document.querySelector('#url-input');

const watcher = (state) => onChange(state, (path, value) => render(state, value, path));

const validate = (i18n, url) => {
  setLocale({
    mixed: {
      default: 'field_invalid',
    },
    string: {
      url: i18n.t('validation.errors.errorURL'),
      min: i18n.t('validation.errors.errorRequared'),
    },
  });

  const urlSchema = yup.string().url().min(1);

  return urlSchema.validate(url);
};
const createPosts = (state, newPosts, feedId) => {
  newPosts.forEach((post) => {
    post.feedId = feedId;
    post.id = _.uniqueId();
    post.readOut = false;
  });
  watcher(state).content.posts.unshift(...newPosts);
};
const getAxiosResponse = (rssUrl) => {
  const allOrigins = 'https://allorigins.hexlet.app/get';
  const newUrl = new URL(allOrigins);
  newUrl.searchParams.set('url', rssUrl);
  newUrl.searchParams.set('disableCache', 'true');
  return axios.get(newUrl);
};
const getNewPosts = (state) => {
  const promises = state.content.feeds.map(({ link, feedId }) => getAxiosResponse(link)
    .then((response) => {
      const { posts } = parserRss(response, feedId);
      const addedPosts = state.content.posts.map((post) => post.link);
      const newPosts = posts.filter((post) => !addedPosts.includes(post.link));
      if (newPosts.length > 0) {
        createPosts(state, newPosts, feedId);
      }
      return Promise.resolve();
    })
    .catch(() => {
      state.errorMessage = state.i18n.t('loading.errrors.errorNetWork');
      throw new Error();
    }));

  Promise.allSettled(promises).finally(() => {
    setTimeout(() => getNewPosts(state), 5000);
  });
};

const handlerClick = (state, btns) => {
  btns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const currentId = e.target.getAttribute('data-id');
      watcher(state).uiState.modalId = currentId;
      watcher(state).uiState.visitedLinksIds.add(currentId);
    });
  });
};

const handler = (state) => {
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
        state.isValid = true;
        state.validUrls.push(rssUrl);
        watcher(state).currentProcess = 'loadingRssContent';
        return getAxiosResponse(rssUrl);
      })
      .catch(() => {
        state.errorMessage = state.i18n.t('loading.errrors.errorNetWork');
        throw new Error();
      })
      .then((response) => {
        const feedId = _.uniqueId();
        const { posts, feed } = parserRss(response, feedId);
        const currentUrl = state.validUrls[state.validUrls.length - 1];
        watcher(state).content.feeds.unshift({ ...feed, link: currentUrl });
        createPosts(state, posts, feedId);
        watcher(state).currentProcess = 'loadedRssContent';
        const btns = document.querySelectorAll('.btn-sm');
        handlerClick(state, btns);
      })
      .catch((error) => {
        if (error.message === 'errorParsing') {
          state.errorMessage = state.i18n.t('loading.errrors.errorResource');
          state.validUrls.pop();
        } else {
          state.errorMessage = error.message;
        }
        state.isValid = null;
        watcher(state).isValid = false;
        watcher(state).currentProcess = null;
      });
  });
};

const app = () => {
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
      getNewPosts(watcher(state));
    })
    .catch((e) => {
      throw new Error(e);
    });
};
export default app;
