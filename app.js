import 'babel-polyfill'
const API_URL = 'https://api.hnpwa.com/v0/news/1.json'

const getData = async () => {
  const response = await fetch(API_URL)
  const json = await response.json();
  return json
}

const main = async () => {

  const data = await getData();

  const news = data.map(({id, title, comments_count}) => {

    return `
      <li>
        <a href="#${id}">${title} (${comments_count})</a>
      </li>
    `
  }).join("")

  
  console.log(data)

  document.querySelector("#root").innerHTML = `
  <ul>
    ${news}
  </ul>
`

}

main();

