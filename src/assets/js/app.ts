import 'babel-polyfill';
import 'tailwindcss/tailwind.css';

type Comment = {
  user: string;
  time_ago: string;
  content: string;
  comments: Comment[];
};
type Feed = {
  read?: boolean;
  comments_count: string;
  user: string;
  points: string;
  time_ago: string;
  id: number;
  title: string;
  comments: Comment[];
};

class NewsPage {
  private API_URL: string;
  private CONTENT_URL: string;
  private CONTAINER: string;
  private currentPage?: number;
  private hasNext: boolean;
  private items: Feed[];
  private template: string;

  constructor(apiUrl: string, contentUrl: string, container: string) {
    this.API_URL = apiUrl;
    this.CONTENT_URL = contentUrl;
    this.CONTAINER = container;
    this.currentPage = 1;
    this.hasNext = true;
    this.items = [];
    this.template = '';

    window.addEventListener('hashchange', () => {
      this.render();
    });
  }

  private getNews = async () => {
    const response = await fetch(this.API_URL.replace('@page', String(this.currentPage)));
    const json = await response.json();
    return json;
  };

  private getNew = async (id = 0) => {
    const response = await fetch(this.CONTENT_URL.replace('@id', String(id)));
    const json = await response.json();
    return json;
  };

  private makeComment = (comments: Comment[], called = 0): string => {
    return comments
      .map(({ user, time_ago, content, comments }) => {
        if (comments.length) {
          return this.makeComment(comments, called++);
        }
        return `
        <div style="padding-left: ${called * 40}px" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${user}</strong> ${time_ago}
          </div>
          <p class="text-gray-700">${content}</p>
        </div>  
        `;
      })
      .join('');
  };

  private renderDetail = async (id: number) => {
    const { title, content, comments } = await this.getNew(id);
    for (const item of this.items) {
      if (item.id === Number(id)) {
        item.read = true;
        break;
      }
    }

    const template = `
      <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/${this.currentPage}" class="text-gray-500">
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

    this.updatePage(
      this.updateTemplates(template, [[' {{comments}}', this.makeComment(comments)]]),
    );
  };

  private renderList = async () => {
    this.hasNext = this.items.length === 30;

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

    const listData = this.items
      .map(({ read, comments_count, user, points, time_ago, id, title }) => {
        return `
          <div class="p-6 ${
            read ? 'bg-red-500' : 'bg-white'
          } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-blue-100">
          <div class="flex">
            <div class="flex-auto">
              <a href="#/show/${id}">${title}</a>  
            </div>
            <div class="text-center text-sm">
              <div class="w-10 text-white bg-blue-300 rounded-lg px-0 py-2">${comments_count}</div>
            </div>
          </div>
          <div class="flex mt-3">
            <div class="grid grid-cols-3 text-sm text-gray-500">
              <div><i class="fas fa-user mr-1"></i>${user}</div>
              <div><i class="fas fa-heart mr-1"></i>${points ?? 0}</div>
              <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
            </div>  
          </div>
        </div>  
        `;
      })
      .join('');

    const paginationData = `
    <div>
      <a href="#/page/${
        Number(this.currentPage) - 1 || 1
      }" class="text-gray-500 fas fa-arrow-circle-left"></a>
      <a href="#/page/${
        this.hasNext ? Number(this.currentPage) + 1 : this.currentPage
      }" class="text-gray-500 fas fa-arrow-circle-right"></a>
    </div>
    `;

    this.updatePage(
      this.updateTemplates(template, [
        ['{{title_list}}', listData],
        ['{{pagination}}', paginationData],
      ]),
    );
  };

  private updatePage = (htmlText: string) => {
    (document.querySelector(this.CONTAINER) as HTMLDivElement).innerHTML =
      htmlText || this.template;
  };

  updateTemplates = (template: string, updateData: [string, any][]) => {
    updateData.forEach(([key, data]) => {
      template = template.replace(key, data);
    });
    return template;
  };

  private attachRead = (items: Feed[]) => {
    return items.map(item => {
      item.read = false;
      return item;
    });
  };

  render = async () => {
    const { hash } = location;

    const nameSpace = hash.match(/\/[a-z]+/)?.[0];

    if (!this.items.length) {
      this.items = this.attachRead(await this.getNews());
    }

    switch (nameSpace) {
      case '/show': {
        const id = Number(hash.match(/\/[0-9]+/)?.[0].substring(1) ?? 1);
        return this.renderDetail(id);
      }
      case '/page': {
        this.currentPage = Number(hash.match(/#\/page\/(\d+)/)?.[1] ?? 1);
        return this.renderList();
      }
      default: {
        this.renderList();
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
