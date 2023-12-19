/* eslint-disable no-shadow */
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

const elements = {
  form: document.querySelector('.rss-form'),
  input: document.querySelector('#url-input'),
  postSection: document.querySelector('.posts'),
  blockAboutTheAuthor: document.querySelector('.text-center'),
  mainTitle: document.querySelector('.display-3'),
  lead: document.querySelector('.lead'),
  forUrlInput: document.querySelector('[for="url-input"]'),
  buttonForAdd: document.querySelector('.btn-lg'),
  blockInfo: document.querySelector('.text-info'),
  btnFullArticle: document.querySelector('.full-article'),
  btnCloseModalContent: document.querySelector('.btn-secondary'),
};

const app = () => {
  const fillingBlocksContent = (i18Instance) => {
    const linkAndNameAuthor = document.createElement('a');
    linkAndNameAuthor.setAttribute('href', i18Instance.t('linkGithubAuthor'));
    linkAndNameAuthor.textContent = i18Instance.t('author');
    elements.blockAboutTheAuthor.append(i18Instance.t('textCreatedBy'), ' ', linkAndNameAuthor);
    elements.mainTitle.textContent = i18Instance.t('textMainTitle');
    elements.lead.textContent = i18Instance.t('textLead');
    elements.forUrlInput.textContent = i18Instance.t('textForUrlInput');
    elements.buttonForAdd.textContent = i18Instance.t('textButton');
    elements.blockInfo.textContent = i18Instance.t('textInfo');
    elements.btnFullArticle.textContent = i18Instance.t('textBtnFullArticle');
    elements.btnCloseModalContent.textContent = i18Instance.t('textCloseModalContent');
  };

  const i18Instance = i18next.createInstance();
  i18Instance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
    .then(() => {
      fillingBlocksContent(i18Instance);
      const state = {
        errorMessage: null,
        currentProcess: null, // 'loadingRssContent, loadedRssContent'
        isValid: null,
        currentUrl: null,
        validUrls: [],
        content: {
          newPosts: [],
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
          notOneOf: 'errorUniqUrl',
        },
        string: {
          url: 'errorURL',
          min: 'errorRequared',
        },
      });

      const watcher = onChange(state, (path, value) => render(state, value, i18Instance, path));

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
        state.content.posts.unshift(...newPosts);
        watcher.content.newPosts = [...newPosts];
      };

      const getUrlWithProxy = (rssUrl) => {
        const allOrigins = 'https://allorigins.hexlet.app/get';
        const urlWithProxy = new URL(allOrigins);
        urlWithProxy.searchParams.set('url', rssUrl);
        urlWithProxy.searchParams.set('disableCache', 'true');
        return urlWithProxy.toString();
      };

      const getNewPosts = (state) => {
        const promises = state.content.feeds.map(({ link, feedId }) => {
          const urlWithProxy = getUrlWithProxy(link);
          return axios.get(urlWithProxy)
            .then((response) => {
              const { posts } = parserRss(response);
              const addedPosts = state.content.posts.map((post) => post.link);
              const newPosts = posts.filter((post) => !addedPosts.includes(post.link));
              if (newPosts.length > 0) {
                createPosts(newPosts, feedId);
              }
              return Promise.resolve();
            });
        });
        Promise.allSettled(promises).finally(() => {
          setTimeout(() => getNewPosts(watcher), 5000);
        });
      };

      getNewPosts(watcher);

      elements.postSection.addEventListener('click', (e) => {
        const currentId = e.target.getAttribute('data-id');
        if (currentId) {
          const isButton = e.target.tagName === 'BUTTON';
          if (isButton) {
            watcher.uiState.modalId = currentId;
          }
          watcher.uiState.visitedLinksIds.add(currentId);
        }
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = elements.input.value;
        validate(url, state.validUrls)
          .then((rssUrl) => {
            state.isValid = true;
            state.currentUrl = rssUrl;
            watcher.currentProcess = 'loadingRssContent';
            const urlWithProxy = getUrlWithProxy(rssUrl);
            return axios.get(urlWithProxy);
          })
          .then((response) => {
            state.validUrls.push(state.currentUrl);
            const feedId = _.uniqueId();
            const { posts, feed } = parserRss(response);
            const currentUrl = state.validUrls[state.validUrls.length - 1];
            watcher.content.feeds.unshift({ ...feed, feedId, link: currentUrl });
            createPosts(posts, feedId);
            watcher.currentProcess = 'loadedRssContent';
          })
          .catch((error) => {
            state.errorMessage = error.message;
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
