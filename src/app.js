import 'babel-polyfill';
import 'tailwindcss/tailwind.css';

class NewsPage {
  #API_URL;
  #CONTENT_URL;
  #CONTAINER;
  #currentPage;
  #hasNext;
  #items;
  #template;
  #baseTemplate;

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

    const template = `
      <div class="my-4">
        <h1>{{title}}</h1>
        <a href="#/page/{{current_page}}">목록으로</a>
      </div>
    `;

    this.#updatePage(
      this.#updateTemplates(template, [
        ['{{title}}', title],
        ['{{current_page}}', this.#currentPage],
      ]),
    );
  };

  #renderList = async () => {
    this.#items = await this.#getNews();
    this.#hasNext = this.#items.length === 30;

    const template = `
      <div class="p-10">
        <h1>Hacker News</h1>
        <ul>
          {{title_list}}
        </ul>
        <div>
          {{pagination}}
        </div>
      </div>
    `;

    const listData = this.#items
      .map(({ id, title, comments_count }) => {
        return `
          <li>
            <a href="#/show/${id}">${title} (${comments_count})</a>
          </li>
        `;
      })
      .join('');

    const paginationData = `
    <div>
      <a href="#/page/${Number(this.#currentPage) - 1 || 1}">이전 페이지</a>
      <a href="#/page/${
        this.#hasNext ? Number(this.#currentPage) + 1 : this.#currentPage
      }">다음 페이지</a>
    </div>
    `;

    this.#updatePage(
      this.#updateTemplates(template, [
        ['{{title_list}}', listData],
        ['{{pagination}}', paginationData],
      ]),
    );
  };

  #updatePage = htmlText => {
    document.querySelector(this.#CONTAINER).innerHTML = htmlText || this.#template;
  };

  #updateTemplates = (template, updateData) => {
    updateData.forEach(([key, data]) => {
      template = template.replace(key, data);
    });
    return template;
  };

  #updateTemplate = (template, key, data) => {
    template.replace(key, data);
    return template;
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
