import 'babel-polyfill';

class NewsPage {
  #API_URL;
  #CONTENT_URL;
  #CONTAINER;
  #currentPage;
  #hasNext;
  #items;

  constructor(apiUrl, contentUrl, container) {
    this.#API_URL = apiUrl;
    this.#CONTENT_URL = contentUrl;
    this.#CONTAINER = container;
    this.#currentPage = 1;
    this.#hasNext = true;
    this.#items = [];

    window.addEventListener('hashchange', this.render);
  }

  #resetPage = () => {
    document.querySelector(this.#CONTAINER).innerHTML = '';
  };

  #getNews = async () => {
    const response = await fetch(this.#API_URL.replace('@page', this.#currentPage));
    const json = await response.json();
    return json;
  };

  #getNew = async (id = 0) => {
    const response = await fetch(this.#CONTENT_URL.replace('@id', id));
    const json = await response.json();
    return json;
  };

  #renderContent = async id => {
    const { title } = await this.#getNew(id);
    this.#changePage(`
    <div>
      <h1>${title}</h1>
      <a href="#/page/${this.#currentPage}">목록으로</a>
    </div>
    `);
  };

  #renderList = async () => {
    this.#items = await this.#getNews();
    this.#hasNext = this.#items.length === 30;

    this.#changePage(`
    <ul>
      ${this.#items
        .map(({ id, title, comments_count }) => {
          return `
          <li>
            <a href="#/show/${id}">${title} (${comments_count})</a>
          </li>
        `;
        })
        .join('')}
    </ul>
    <div>
        <a href="#/page/${Number(this.#currentPage) - 1 || 1}">이전 페이지</a>
        <a href="#/page/${
          this.#hasNext ? Number(this.#currentPage) + 1 : this.#currentPage
        }">다음 페이지</a>
    </div>
    `);
  };

  #changePage = htmlText => {
    document.querySelector(this.#CONTAINER).innerHTML = htmlText;
  };

  render = () => {
    const { hash } = location;

    const nameSpace = hash.match(/\/[a-z]+/)?.[0];

    switch (nameSpace) {
      case '/show': {
        const id = hash.match(/\/[0-9]+/)?.[0].substring(1);
        return this.#renderContent(id);
      }
      case '/page': {
        this.#currentPage = hash.match(/#\/page\/(\d+)/)?.[1];
        return this.#renderList();
      }
      default: {
        this.#renderList();
      }
    }
  };
}

const newPage = new NewsPage(
  'https://api.hnpwa.com/v0/news/@page.json',
  'https://api.hnpwa.com/v0/item/@id.json',
  '#root',
);

newPage.render();
