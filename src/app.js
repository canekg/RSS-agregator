import watcherValidationURL from './view/watcher.js';
import handlerOfBtnFormSection from './handlers/handlerSubmit.js';

const app = (state) => {
  const input = document.querySelector('#url-input');

  watcherValidationURL(state);
  handlerOfBtnFormSection(state, input);
};

export default app;
