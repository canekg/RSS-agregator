import _ from 'lodash';

const parserRss = (response) => {
  try {
    const parser = new DOMParser();
    const data = parser.parseFromString(response.data.contents, 'application/xml');
    const feed = {
      title: data.querySelector('channel title').textContent,
      description: data.querySelector('channel description').textContent,
    };

    const items = Array.from(data.querySelectorAll('item'));
    const posts = items.map((item) => {
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      const link = item.querySelector('link').textContent;
      return {
        title, description, link,
      };
    });
    return { feed, posts };
  } catch {
    throw new Error('errorResource');
  }
};

export default parserRss;
