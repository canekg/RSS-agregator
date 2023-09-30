/* eslint-disable no-param-reassign */
import axios from 'axios';
import _ from 'lodash';
import validate from '../validation/validate.js';
import watcher from '../view/watcher.js';
import parserRss from '../parsers/parserRss.js';

const form = document.querySelector('.rss-form');
const input = document.querySelector('#url-input');

const getAxiosResponse = (rssUrl) => {
  const allOrigins = 'https://allorigins.hexlet.app/get';
  const newUrl = new URL(allOrigins);
  newUrl.searchParams.set('url', rssUrl);
  newUrl.searchParams.set('disableCache', 'true');
  return axios.get(newUrl);
};

function handlerClick(state, btns) {
  btns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const currentId = e.target.getAttribute('data-id');
      watcher(state).uiState.modalId = currentId;
      watcher(state).uiState.visitedLinksIds.add(currentId);
    });
  });
}

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
        // state.isValid = null;
        state.isValid = true;
        state.validUrls.push(rssUrl);
        watcher(state).currentProcess = 'loadingRssContent';
        return getAxiosResponse(rssUrl);
      })
      .then((response) => {
        const feedId = _.uniqueId();
        const { posts, feed } = parserRss(response, feedId);
        watcher(state).content.feeds.push(feed);
        watcher(state).content.posts.push(...posts);
        watcher(state).currentProcess = 'loadedRssContent';
        const btns = document.querySelectorAll('.btn-sm');
        handlerClick(state, btns);
      })
      .catch((error) => {
        state.errorMessage = error.message;
        state.isValid = null;
        watcher(state).isValid = false;
      });
  });
};

export default handler;
