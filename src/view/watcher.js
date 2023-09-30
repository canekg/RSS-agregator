import onChange from 'on-change';
import render from '../render/render.js';

const watcher = (state) => onChange(state, (path, value) => {
  render(state, value, path);
});

export default watcher;
