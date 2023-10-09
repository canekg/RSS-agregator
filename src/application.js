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
const postSection = document.querySelector('.posts');

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

      setLocale({
        mixed: {
          notOneOf: state.i18n.t('validation.errors.errorUniqUrl'),
        },
        string: {
          url: state.i18n.t('validation.errors.errorURL'),
          min: state.i18n.t('validation.errors.errorRequared'),
        },
      });

      const watcher = onChange(state, (path, value) => render(state, value, path));

      const validate = (url, urlList) => {
        const urlSchema = yup.string().url().min(1).notOneOf(urlList);
        return urlSchema.validate(url);
      };

      const createPosts = (newPosts, feedId) => {
        newPosts.forEach((post) => {
          post.feedId = feedId;
          post.id = _.uniqueId();
          post.readOut = false;
        });
        watcher.content.posts.unshift(...newPosts);
      };

      const getNewUrl = (rssUrl) => {
        const allOrigins = 'https://allorigins.hexlet.app/get';
        const newUrl = new URL(allOrigins);
        newUrl.searchParams.set('url', rssUrl);
        newUrl.searchParams.set('disableCache', 'true');
        return newUrl;
      };

      const getAxiosResponse = (rssUrl) => {
        const newUrl = getNewUrl(rssUrl);
        return axios.get(newUrl);
      };

      const getNewPosts = () => {
        const promises = state.content.feeds.map(({ link, feedId }) => getAxiosResponse(link)
          .then((response) => {
            const { posts } = parserRss(response, feedId);
            const addedPosts = state.content.posts.map((post) => post.link);
            const newPosts = posts.filter((post) => !addedPosts.includes(post.link));
            if (newPosts.length > 0) {
              createPosts(newPosts, feedId);
            }
            return Promise.resolve();
          }));
        Promise.allSettled(promises).finally(() => {
          setTimeout(() => getNewPosts(), 5000);
        });
      };

      getNewPosts(watcher);

      postSection.addEventListener('click', (e) => {
        const isButton = e.target.tagName === 'BUTTON';
        if (isButton) {
          const currentId = e.target.getAttribute('data-id');
          watcher.uiState.modalId = currentId;
          watcher.uiState.visitedLinksIds.add(currentId);
        }
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = input.value;
        validate(url, state.validUrls)
          .then((rssUrl) => {
            state.isValid = true;
            state.validUrls.push(rssUrl);
            watcher.currentProcess = 'loadingRssContent';
            return getAxiosResponse(rssUrl);
          })
          .then((response) => {
            const feedId = _.uniqueId();
            const { posts, feed } = parserRss(response, feedId);
            const currentUrl = state.validUrls[state.validUrls.length - 1];
            watcher.content.feeds.unshift({ ...feed, link: currentUrl });
            createPosts(posts, feedId);
            watcher.currentProcess = 'loadedRssContent';
          })
          .catch((error) => {
            switch (error.message) {
              case 'errorParsing': {
                state.errorMessage = state.i18n.t('loading.errrors.errorResource');
                state.validUrls.pop();
                break;
              }
              case 'Network Error': {
                state.errorMessage = state.i18n.t('loading.errrors.errorNetWork');
                state.validUrls.pop();
                break;
              }
              default: {
                state.errorMessage = error.message;
              }
            }
            state.isValid = null;
            watcher.isValid = false;
            watcher.currentProcess = null;
          });
      });
    })
    .catch((error) => {
      throw new Error(error);
    });
};
export default app;
