const addButton = document.getElementById('add-movie-btn');
const srchButton = document.getElementById('search-btn');

const movies = [];

const showMovie = (filter = '') => {
    const movieList = document.getElementById('movie-list');

    //remove visible class for the movie list element 
    if (movies.length === 0) {
        movieList.classList.remove('visible');
        return;
    } else {
        movieList.classList.add('visible');
    }

    //doing this will rerender the entire element from scratch
    //whenever a new element was added, this is just another approach for learning
    //about the objects
    movieList.innerHTML = '';
    
    const filteredMovies = !filter ? movies : movies.filter(movie => movie.info.title.includes(filter));

    filteredMovies.forEach(movie => {
        const movieEl = document.createElement('li');
        const { info, ...otherProps } = movie;
        console.log(otherProps);

        let { getFormattedTitle } = movie;
        let text = getFormattedTitle.apply(movie) + ' - ';

        for (const key in info) {
            if (key !== 'title' && key !== '_title') {
                text = text + `${key}: ${info[key]}`;
            }
        }
        movieEl.textContent = text;
        movieList.append(movieEl);
    });
};

const addMovie = () => {
    const title = document.getElementById('title').value;
    const extraName = document.getElementById('extra-name').value;
    const extraValue = document.getElementById('extra-value').value;

    if (extraName.trim() === '' || extraValue.trim() === ''){
        return;
    }

    const newMovie = {
        info: {
        //setter function 
        set title(val) {
            if (val.trim() === '') {
                this._title = 'DEFAULT';
                return;
            }

            this._title = val;
        },
        //getter function
        get title() {
            return this._title;
        },
        [extraName]: extraValue
        },
        id: Math.random().toString(),
        getFormattedTitle() {
            return this.info.title.toUpperCase();
        }
    };

    newMovie.info.title = title;

    movies.push(newMovie);
    showMovie();
};

const searchMovie = () => {
    const filterTerm = document.getElementById('filter-title').value;
    showMovie(filterTerm);
};

const addButtonHandler = () => {
    //console.log("add button handler");
    addMovie();
};

const searchButtonHandler = () => {
    searchMovie();
};


addButton.addEventListener('click',addButtonHandler);
srchButton.addEventListener('click',searchButtonHandler);