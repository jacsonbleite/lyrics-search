const form = document.querySelector('#form') //formulário
const searchInput = document.querySelector('#search') // campo input do formulário
const songsContainer = document.querySelector('#songs-container') // local de renderização dos dados obtitos
const prevAndNextContainer = document.querySelector('#prev-and-next-container') // seção de paginação de resultatos
const loadingBg = document.querySelector('.loading-bg')



const apiURL = `https://api.lyrics.ovh`


// ativa ou a div loading que mostra ou remove
// um animação enquanto a requisição está em andamento
const loading = (element, classNameRemove, classNameAdd) => {
    element.classList.add(classNameAdd)
    element.classList.remove(classNameRemove)
}

const fetchData = async url => {
    loading(loadingBg,'d-none','d-flex') //ativa o loadind
    const response = await fetch(url)
    loading(loadingBg,'d-flex','d-none') //remove o loadind
    return await response.json()
}

//realiza o avanço ou retorno | paginação
const getMoreSongs = async url => {
    const data = await fetchData(`https://cros-anywhere.herokuapp.com/${url}`)
    insertSongsIntoPage(data);
}

const insetNextAndPrevButtons = ({ prev, next }) => {
    prevAndNextContainer.innerHTML = `
        ${prev ? `<button class="btn" onClick="getMoreSongs('${prev}')">Anteriores</button>` : ''}
        ${next ? `<button class="btn" onClick="getMoreSongs('${next}')">Próximas</button>` : ''} 
    `
}

//renderiza dados no HTML
const insertSongsIntoPage = ({ data, prev, next }) => {
    songsContainer.innerHTML = data.map(({ artist: { name }, title }) => `
        <li class="song">
            <span class="song-artist"><strong>${name}</strong> - ${title}</span>
            <button class="btn" data-artist="${name}" data-song-title="${title}">Ver Letra</button>
        </li>  
    `).join('')

    //itens para paginação - caso necessário
    if (prev || next) {
        insetNextAndPrevButtons({ prev, next })
        return
    }
    prevAndNextContainer.innerHTML = ''
}

//requisição das letras das músicas
const fetchSongs = async term => {
    const data = await await fetchData(`${apiURL}/suggest/${term}`)
    insertSongsIntoPage(data);
}


const handleFormSubmit = event => {
    event.preventDefault() //evita refresh na página
    const searchTerm = searchInput.value.trim() //termo inserido no input
    searchInput.value = ''
    searchInput.focus()

    if (!searchTerm) {
        songsContainer.innerHTML = `<li class="warning-message"> Por favor, digite um termo válido</li>`
        return
    }
    //realizando requisição
    fetchSongs(searchTerm)
}

//evento disparado quando o form for enviado
form.addEventListener('submit', handleFormSubmit)

//renderiza letra da música na página
const insertLyricsIntoPage = ({ lyrics, artist, songTitle }) => {
    songsContainer.innerHTML = `
        <li class="lyrics-container">
         <h2><strong>${songTitle}</strong> -  ${artist}</h2>
         <p class="lyrics">${lyrics}</p>
        </li>
    `
}

//retorna letra da música selecionada
const fetchLyrics = async (artist, songTitle) => {
    const data = await fetchData(`${apiURL}/v1/${artist}/${songTitle}`)
    if (data.error) {
        songsContainer.innerHTML = `        
         <p class="error-lyric">Infelizmente a API não está retornando as letras das músicas  :(</p>                 
    `
        return;
    }
    const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>')
    insertLyricsIntoPage({ lyrics, artist, songTitle })
}

const handleSongsContainerClick = event => {
    const clickedElement = event.target //elemento que recebeu o click
    //verifica se o elemento clicado é uma tag "BUTTON"
    if (clickedElement.tagName === 'BUTTON') {
        const artist = clickedElement.getAttribute('data-artist')
        const songTitle = clickedElement.getAttribute('data-song-title')
        prevAndNextContainer.innerHTML = ''
        fetchLyrics(artist, songTitle)
    }
}

songsContainer.addEventListener('click', handleSongsContainerClick)