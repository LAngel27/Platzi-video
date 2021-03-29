/* VARIABLES GLOBALES */

// Servicios Externos
const ApiUsers = `https://randomuser.me/api/?inc=name,picture&results=`;
const ApiMovies = "https://yts.mx/api/v2/list_movies.json";

// Contenedores
const $navbar = document.getElementById('header');
const $listFriends = document.getElementById('lista-amigos');
const $listMoviesReci = document.getElementById('lista-peliculas-recientes');
const $MoviesAction = document.getElementById('peliculas-accion');
const $moviesDrama = document.getElementById('peliculas-drama');
const $moviesAnimations = document.getElementById('peliculas-animacion');
const $sectionSearch = document.getElementById('seccion-busqueda');
const $modal = document.getElementById('modal');


/* TRABAJAMOS CON EL FORMULARIO DE BUSQUEDA, EL API Y LA SECCION DE BUSQUEDA */


const $formSearch = document.getElementById('formulario');

$formSearch.addEventListener("submit", async (event) => {
    // Evita el recargo de la pagina
    event.preventDefault()

    // Oculta el teclado cuando estamos en dispositivos moviles
    const inputocult = document.createElement('input');
    inputocult.setAttribute('type', 'text');
    document.body.appendChild(inputocult);

    inputocult.focus();
    setTimeout(() => inputocult.remove(), 1)

    // Obtiene el valor del input e intenta la busqueda mediante el API
    const formData = new FormData($formSearch);
    const inputSearch = formData.get("pelicula");

    try {
        if($sectionSearch.children[0]) $sectionSearch.children[0].remove()
        $formSearch.appendChild(createHtmlElement("", $formSearch))

        const pelicula = await loadMovies(`?query_term=${inputSearch}&limit=1`)
        addDataHtml(pelicula, $sectionSearch)
        $formSearch.children[1].remove()
    } catch (error) {
        console.log(error)
        $formSearch.children[1].remove()
    }
});


/* TRABAJAMOS CON PETICIONES AL API Y CON LOS RESULTADOS CREAMOS DIFERENTES ELEMENTOS HTML */


(async function loadData() {
    try {
        const usuario = await loadUsers(1, "usuario")
        addDataHtml(usuario, $navbar)

        const amigos = await loadUsers(8, "amigos")
        addDataHtml(amigos, $listFriends)
    } catch (error) {     
        console.log(error)
    }

    try {
        const moviesRecien = await loadMovies("?query_term=2019&limit=9", 'recientes')
        addDataHtml(moviesRecien, $listMoviesReci)
        
        const peliculasAccion = await loadMovies("?genre=action", 'accion')
        addDataHtml(peliculasAccion, $MoviesAction)
        $MoviesAction.children[0].remove()
        
        const moviesDrama = await loadMovies("?genre=drama", 'drama')
        addDataHtml(moviesDrama, $moviesDrama)
        $moviesDrama.children[0].remove()

        const moviesAnimations = await loadMovies("?genre=animation", 'animacion')
        addDataHtml(moviesAnimations, $moviesAnimations)
        $moviesAnimations.children[0].remove()
    } catch (error) {
        console.log(error)
    }
})();

function loadUsers(cantidad, identificador) {
    let url = ApiUsers + cantidad
    if (sessionStorage.getItem(identificador)) return JSON.parse(window.sessionStorage.getItem(identificador));

    return new Promise((resolve, reject) => {
        fetch(url)
            .then(data => data.json())
            .then(data => {
                if (data.results.length == 0) throw new Error('No se encontró ningun resultado')

                sessionStorage.setItem(identificador, JSON.stringify(data.results))
                return resolve(data.results)
            })
            .catch(error => {
                return reject(`${error.message} | ${url}`)
            })
    }) 
}

function loadMovies(urlOptions, identificador) {
    let url = ApiMovies + urlOptions;
    if (sessionStorage.getItem(identificador)) return JSON.parse(window.sessionStorage.getItem(identificador));

    return new Promise((resolve, reject) => {
        fetch(url)
            .then(data => data.json())
            .then(data => {
                if (data.data.movie_count == 0) throw new Error('No se encontró ningun resultado')
            
                if (identificador) sessionStorage.setItem(identificador, JSON.stringify(data.data.movies))
                return resolve(data.data.movies)
            })
            .catch(error => {
                return reject(`${error.message} | ${url}`)
            })
    }) 
}

function addDataHtml(datos, $contenedor) {
    datos.map(data => {
        let $element = createHtmlElement(data, $contenedor);
        $contenedor.appendChild($element)

        if ($contenedor != $navbar && $contenedor != $listFriends) {
            $element.addEventListener("click", () => openModal(data))
        } 
    })
}

function createHtmlElement(data, $contenedor) {
    switch ($contenedor) {
        case $navbar:
            var $element = document.createElement('p')
            $element.classList.add("header-usuario")
            $element.innerHTML = 
            `<img src="${data.picture.medium}"><span>${data.name.first} ${data.name.last}</span>`
        return $element;

        case $listFriends:
            var $element = document.createElement('li')
            $element.innerHTML = 
            `<a class="menu-link">
                <img src="${data.picture.medium}"><span>${data.name.first} ${data.name.last}</span>
            </a>`
        return $element;

        case $listMoviesReci:
            var $element = document.createElement('li')
            $element.innerHTML = 
            `<a class="menu-link">
                ${data.title_long}
            </a>`
        return $element;

        case $MoviesAction:
        case $moviesDrama:
        case $moviesAnimations:
            var $element = document.createElement('figure')
            $element.classList.add('pelicula')
            $element.innerHTML = 
            `<img src="${data.medium_cover_image}">
            <figcaption>${data.title}</figcaption>`
        return $element;

        case $formSearch:
            var $element = document.createElement('img')
            $element.setAttribute("src", "./images/loader.gif");
            $element.classList.add("imagen-loading")

        return $element;

        case $sectionSearch:
            var $element = document.createElement('figure')
            $element.classList.add('busqueda-pelicula')
            $element.innerHTML = 
            `<img src="${data.medium_cover_image}">
            <div>
                <p>Pelicula Encontrada</p>
                <h3>${data.title}</h3>
            </div>`
        return $element;

        case $modal:
            var $element = document.createElement('div')
            $element.setAttribute("id", "modal-container");
            $element.innerHTML = 
            `<h2 class="modal-titulo">${data.title_long}</h2>
            <div class="modal-contenido">
                <img src="${data.medium_cover_image}">
                <p>${data.description_full}</p>
            </div>
            <button class="modal-button" id="btn-cerrar-modal">Cerrar</button>`

        return $element
    }
}


/* TRABAJAMOS CON UN MODAL PARA MOSTRAR LOS DATOS DE UNA PELICULA */


function openModal(data) {
    $modal.classList.add('activo')
    $modal.classList.remove('inactivo')
    $modal.appendChild(createHtmlElement(data, $modal))

    const $modalContainer = document.getElementById('modal-container');
    const $btnCerrarModal = document.getElementById('btn-cerrar-modal');

    $modal.addEventListener('click', aniamtionCloseModal);
    $btnCerrarModal.addEventListener('click', aniamtionCloseModal);
    $modalContainer.addEventListener('click', event => event.stopPropagation());
}

function aniamtionCloseModal() {
    $modal.classList.add('inactivo')
    $modal.addEventListener('animationend', cerrarModal)
}

function cerrarModal(event) {
    event.target.removeEventListener(event.type, cerrarModal)
    $modal.classList.remove('activo')
    $modal.children[0].remove()
}


/* TRABAJAMOS CON EL BOTON MENU DEL HEADER PARA MOSTRAR LA SECCION MENU EN RESOLUCIONES MENORES A 800px */


(function menuResponsive() {
    const $seccionMenu = document.getElementById('seccion-menu')
    
    const $btnMenu = document.getElementById('menu-button')
    const $capaMenu = document.getElementById('menu-capa')
    $btnMenu.addEventListener('click', () => $seccionMenu.classList.toggle('activo'))
    $capaMenu.addEventListener('click', () => $seccionMenu.classList.remove('activo'))
})();

/* TRABAJAMOS CON EL BODY Y OBTENEMOS SU VH REAL DEBIDO A PROBLEMAS CON NAVEGADORES MOVILES */

function calcularViewportHeight() {
    const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    document.body.style.height = viewportHeight + "px";
}
calcularViewportHeight()
window.addEventListener('onorientationchange', calcularViewportHeight, true);
window.addEventListener('resize', calcularViewportHeight, true)


