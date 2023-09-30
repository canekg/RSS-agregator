import _ from 'lodash';

const parserRss = (response, feedId) => {
  try {
    const parser = new DOMParser();
    const data = parser.parseFromString(response.data.contents, 'application/xml');
    const feed = {
      title: data.querySelector('channel title').textContent,
      description: data.querySelector('channel description').textContent,
      feedId,
    };

    const items = Array.from(data.querySelectorAll('item'));
    const posts = items.map((item) => {
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      const link = item.querySelector('link').textContent;
      const id = _.uniqueId();
      return {
        title, description, link, feedId, id,
      };
    });
    return { feed, posts };
  } catch {
    throw new Error('errorParsing');
  }
};

export default parserRss;
