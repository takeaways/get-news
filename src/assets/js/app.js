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
    const { title, content } = await this.#getNew(id);

    const template = `
      <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/${this.#currentPage}" class="text-gray-500">
                  <i class="fa fa-times"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="h-full border rounded-xl bg-white m-6 p-4 ">
          <h2>${title}</h2>
          <div class="text-gray-400 h-20">
            ${content}
          </div>

          {{comments}}

        </div>
      </div>
    `;

    this.#updatePage(this.#updateTemplates(template, [[' {{comments}}', 'comments']]));
  };

  #renderList = async () => {
    this.#items = await this.#getNews();
    this.#hasNext = this.#items.length === 30;

    const template = `
      <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              {{pagination}}
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{title_list}}       
      </div>
    </div>
    `;

    const listData = this.#items
      .map(({ read, comments_count, user, points, time_ago, id, title }) => {
        return `
          <div class="p-6 ${
            read ? 'bg-red-500' : 'bg-white'
          } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
          <div class="flex">
            <div class="flex-auto">
              <a href="#/show/${id}">${title}</a>  
            </div>
            <div class="text-center text-sm">
              <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
            </div>
          </div>
          <div class="flex mt-3">
            <div class="grid grid-cols-3 text-sm text-gray-500">
              <div><i class="fas fa-user mr-1"></i>${user}</div>
              <div><i class="fas fa-heart mr-1"></i>${points}</div>
              <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
            </div>  
          </div>
        </div>  
        `;
      })
      .join('');

    const paginationData = `
    <div>
      <a href="#/page/${Number(this.#currentPage) - 1 || 1}" class="text-gray-500">이전 페이지</a>
      <a href="#/page/${
        this.#hasNext ? Number(this.#currentPage) + 1 : this.#currentPage
      }" class="text-gray-500">다음 페이지</a>
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
