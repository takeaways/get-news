import 'babel-polyfill';
const API_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const CONTAINER = '#root';

class NewsPage {
  #API_URL;
  #CONTENT_URL;
  #CONTAINER;

  constructor(apiUrl, contentUrl, container) {
    this.#API_URL = apiUrl;
    this.#CONTENT_URL = contentUrl;
    this.#CONTAINER = container;

    window.addEventListener('hashchange', this.#renderContent);
  }

  #getNews = async () => {
    const response = await fetch(API_URL);
    const json = await response.json();
    return json;
  };

  #getNew = async (id = 0) => {
    const response = await fetch(CONTENT_URL.replace('@id', id));
    const json = await response.json();
    return json;
  };

  #renderContent = async () => {
    const { title } = await this.#getNew(location.hash.slice(1));
    const template = document.createElement('div');
    template.innerHTML = `
      <div>
        <h1>${title}</h1>
      </div>
    `;
    this.#append(CONTAINER, template.firstElementChild);
  };

  #renderList = async () => {
    const data = await this.#getNews();
    const template = document.createElement('div');
    template.innerHTML = `
      <ul>
        ${data
          .map(({ id, title, comments_count }) => {
            return `
            <li>
              <a href=#${id}>${title} (${comments_count})</a>
            </li>
          `;
          })
          .join('')}
      </ul>
    `;
    this.#append(CONTAINER, template.firstElementChild);
  };

  #append = (target, child) => {
    document.querySelector(target).appendChild(child);
  };

  render() {
    this.#renderList();
  }
}

const newsPage = new NewsPage();
newsPage.render(API_URL, CONTENT_URL, CONTAINER);
