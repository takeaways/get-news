import 'babel-polyfill'
const API_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'

const CONTAINER = "#root"


const view = {
  append:(target, child) => {
    document.querySelector(target).appendChild(child)
  }
}

const getNews = async () => {
  const response = await fetch(API_URL)
  const json = await response.json();
  return json
}

const getNew = async (id = 0) => {
  const response = await fetch(CONTENT_URL.replace("@id", id))
  const json = await response.json();
  return json
}


const renderList = async () => {
  const ul = document.createElement("ul")
  const data = await getNews();

  data.forEach(({id, title, comments_count}) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.textContent =`${title} (${comments_count})` 
    a.href = `#${id}` 
    

    li.appendChild(a)
    ul.appendChild(li)
  })

  view.append(CONTAINER, ul)
}

const renderContent = async () => {
  const {title} = await getNew(location.hash.slice(1))
  
  const content = document.createElement('div')
  const heading = document.createElement('h1')

  heading.innerText = title

  content.appendChild(heading)

  view.append(CONTAINER, content)
}

const main = async () => {
  renderList()

  window.addEventListener("hashchange",renderContent)
}

main();

