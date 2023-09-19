import onChange from 'on-change';
import render from '../render/renderErrorRssUrl.js';

const watcherValidationURL = (state) => {
  const watcher = onChange(state, (path, isValid) => {
    render(state.errorMessage, isValid);
  });
  return watcher;
};

export default watcherValidationURL;
