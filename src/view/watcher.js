import onChange from 'on-change';
import render from '../render/renderErrorRssUrl.js';

const watcherValidationURL = (state) => {
  const watcher = onChange(state, (path, isValid) => {
    if (isValid === true) return;
    render(state.errorMessage);
  });
  return watcher;
};

export default watcherValidationURL;
