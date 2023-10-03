const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');
const feedSection = document.querySelector('.feeds');
const postSection = document.querySelector('.posts');
const modalWindow = document.querySelector('.modal-content');
const btn = document.querySelector('button[type="submit"]');

const renderFeedback = (state, value) => {
  if (state.isValid) {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = state.i18n.t(`loading.${value}`);
  } else {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = state.errorMessage;
  }
  input.focus();
  input.value = '';
};

const renderModalContent = (state) => {
  const { modalId } = state.uiState;
  const activePost = state.content.posts.find(({ id }) => id === modalId);
  const { title, description, link } = activePost;
  const modalTitle = modalWindow.querySelector('.modal-title');
  modalTitle.textContent = title;

  const modalBody = modalWindow.querySelector('.modal-body');
  modalBody.textContent = description;

  const readMoreButton = modalWindow.querySelector('.full-article');
  readMoreButton.setAttribute('href', link);
};

const buildContentBlock = (blockName) => {
  const contentBlock = document.createElement('div');
  contentBlock.classList.add('card', 'border-0');
  const nameDiv = document.createElement('div');
  nameDiv.classList.add('card-body');
  nameDiv.innerHTML = `<h2 class="card-title h4">${blockName}</h2>`;
  const contentList = document.createElement('ul');
  contentList.classList.add('list-group', 'border-0', 'rounded-0');
  contentBlock.append(nameDiv, contentList);
  return contentBlock;
};

const renderContentConteiner = () => {
  const firstRound = feedSection.childNodes.length === 0;
  if (firstRound) {
    const feedsBlock = buildContentBlock('Фиды');
    feedSection.append(feedsBlock);
    const postsBlock = buildContentBlock('Посты');
    postSection.append(postsBlock);
  }
};
const renderFeeds = (state) => {
  const { feeds } = state.content;
  const newFeeds = feeds.map((feed) => {
    const { title, description } = feed;
    const newFeed = document.createElement('li');
    newFeed.classList.add('list-group-item', 'border-0', 'border-end-0');

    const hTitle = document.createElement('h3');
    hTitle.classList.add('h6', 'm-0');
    hTitle.textContent = title;

    const pDescriotion = document.createElement('p');
    pDescriotion.classList.add('m-0', 'small', 'text-black-50');
    pDescriotion.textContent = description;

    newFeed.append(hTitle, pDescriotion);
    return newFeed;
  });
  return newFeeds;
};
const renderPosts = (state) => {
  const { posts } = state.content;
  const content = posts.map((post) => {
    const { title, link, id } = post;
    const newPost = document.createElement('li');
    newPost.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    const newPostLink = document.createElement('a');
    newPostLink.textContent = title;
    newPostLink.classList.add('fw-bold');
    newPost.classList.add('fw-bold');
    newPostLink.setAttribute('data-id', id);
    newPostLink.setAttribute('target', '_blank');
    newPostLink.setAttribute('rel', 'noopener noreferrer');
    newPostLink.setAttribute('href', link);

    const newPostButton = document.createElement('button');
    newPostButton.setAttribute('type', 'button');
    newPostButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    newPostButton.setAttribute('data-id', id);
    newPostButton.setAttribute('data-bs-toggle', 'modal');
    newPostButton.setAttribute('data-bs-target', '#modal');
    newPostButton.textContent = 'Просмотр';

    newPost.append(newPostLink, newPostButton);
    return newPost;
  });

  return content;
};

const renderButtonInput = (state) => {
  if (state.currentProcess === 'loadingRssContent') {
    btn.classList.add('disabled');
    input.setAttribute('readonly', '');
  } else {
    btn.classList.remove('disabled');
    input.removeAttribute('readonly');
  }
};

const render = (state, value, path) => {
  switch (path) {
    case 'isValid': {
      renderFeedback(state, value);
      break;
    }
    case 'content.feeds': {
      renderContentConteiner();
      const feedsList = feedSection.querySelector('ul');
      const view = renderFeeds(state);
      feedsList.replaceChildren(...view);
      break;
    }
    case 'content.posts': {
      const postsList = postSection.querySelector('ul');
      const view = renderPosts(state, value);
      postsList.replaceChildren(...view);
      break;
    }
    case 'currentProcess': {
      renderFeedback(state, value);
      renderButtonInput(state);
      break;
    }
    case 'uiState.visitedLinksIds': {
      state.uiState.visitedLinksIds.forEach((id) => {
        const visitedLink = document.querySelector(`a[data-id="${id}"]`);
        visitedLink.classList.remove('fw-bold');
        visitedLink.classList.add('fw-normal', 'link-secondary');
      });
      break;
    }
    case 'uiState.modalId': {
      renderModalContent(state);
      break;
    }
    default: {
      throw new Error('Unexpected changes in state!');
    }
  }
};
export default render;
