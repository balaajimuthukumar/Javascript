//if the id is availabel then using the id to select is the most preferable one insted of accessing via
//query selector or getting all the children of the parent element and select using index
const addMovieModal = document.getElementById('add-modal');
//calling the button using the tag name and child selector is the preferable one but the element can 
//also be called by tag name followed by invoking the lastElementChild
const startAddMovieButton = document.querySelector('header button');
const backdrop = document.getElementById('backdrop');

//the below code is to close the modal when cancel button is pressed
const cancelAddMovieButton = addMovieModal.querySelector(".btn--passive");
const confirmAddMovieButton = cancelAddMovieButton.nextElementSibling;
const userInputs = addMovieModal.querySelectorAll('input');
const entryTextSection = document.getElementById('entry-text');
const deleteMovieModal = document.getElementById('delete-modal');
const confirmDeletetionButton = deleteMovieModal.querySelector(".btn--danger");

const movies = [];

const toggleBackDrop = () => {
    backdrop.classList.toggle("visible");
};

const updateUI = () => {
    //when there are movies added to the array then the entry section default text should be hidden
    // and the list of movies to be shown
    if(movies.length === 0){
        entryTextSection.style.display = 'block';
    }else{
        entryTextSection.style.display = 'none';
    }
};

const closeDeleteMovieModal = () => {
    deleteMovieModal.classList.remove('visible');
    toggleBackDrop();
};

const deleteMovie = (moviId) => {
    console.log("testing inside the delete");
    let selectedMovieIndex = 0;
    for(const movi of movies){
        if(movi.id === moviId)
        {
            break;
        }
        selectedMovieIndex++;
    }

    //this method will remove the element in between the array elements
    //and shift the elements forward
    movies.splice(selectedMovieIndex);
    const listRoot = document.getElementById('movie-list');
    //the below expression can also be done by doing 
    //listRoot.removeChild(children[selectedMovieIndex]);
    listRoot.children[selectedMovieIndex].remove();
    //close the delete pop up after deleting a single element
    closeDeleteMovieModal();
    //make the initial entry text section visible if all the elements are deleted
    updateUI();    
}

const deleteMovieHandler = (moviId) => {
    deleteMovieModal.classList.add('visible');
    toggleBackDrop();
    const cancelDeletionButton = deleteMovieModal.querySelector('.btn--passive');
    let confirmDeletionButton = deleteMovieModal.querySelector('.btn--danger');

    //To create a unique confirm button for every copy of this function
    confirmDeletionButton.replaceWith(confirmDeletionButton.cloneNode(true));
    confirmDeletionButton = deleteMovieModal.querySelector('.btn--danger');

    cancelDeletionButton.removeEventListener('click', closeDeleteMovieModal);
    
    cancelDeletionButton.addEventListener('click',closeDeleteMovieModal);
    confirmDeletionButton.addEventListener('click',deleteMovie.bind(null,moviId));
    //deleteMovie(moviId)
};

const renderNewMovieElement = (moviid,imageUrl,title,rating) => {
    const newMovieElement = document.createElement('li');
    //class name to be added along with the new element to apply predefined styles
    newMovieElement.className = 'movie-element';

    newMovieElement.innerHTML = `
        <div class="movie-element__image">
            <img src="${imageUrl}" alt="${title}"></img>
        </div>
        <div class="movie-element__info">
            <h2>${title}</h2>
            <p>${rating}/5 stars</p>
        </div>    
    `;

    newMovieElement.addEventListener('click',deleteMovieHandler.bind(null,moviid));
    const listRoot = document.getElementById('movie-list');
    listRoot.append(newMovieElement);
};

const closeMovieModal = () => {
    addMovieModal.classList.remove('visible');
};

//A modal that shoould be open when in close and close when in open by clicking the add movie button
const showMovieModal = () => {
    addMovieModal.classList.add('visible');
    toggleBackDrop();
};

const clearMovieInput = () => {
    for(const usrinpt of userInputs)
        usrinpt.value = '';
};

//whenever there is a common function that is shared with other functions that has conflicting operations using the common function
//the functions that share the common function shall use the handler function
const cancelAddMovieHandler = () => {
    closeMovieModal();
    toggleBackDrop();
    clearMovieInput();
};

const addMovieHandler = () => {
    const titleValue = userInputs[0].value.trim();
    const imageUrlValue = userInputs[1].value.trim();
    const ratingValue = userInputs[2].value.trim();

    //since the input fields naturally prevent the entering of not a number values that check is not required. 
    // adding a  '+' in fron of a variable means coercing it from a string type to integer type ex: +ratingValue:find below code
    if(titleValue === '' || imageUrlValue === '' || ratingValue === '' || +ratingValue < 1 || +ratingValue > 5){
        alert('please enter valid values between 1 and 5');
        return;
    }
    
    //we can also add url validation inside this handler if wanted
    
    //movie object
    const newMovie = {
        id:Math.random.toString(),
        title: titleValue,
        image: imageUrlValue,
        rating: ratingValue
    }

    movies.push(newMovie);
    closeMovieModal();
    backDropClickHandler();
    clearMovieInput();
    renderNewMovieElement(newMovie.id,newMovie.image,newMovie.title,newMovie.rating);
    updateUI();
};

const backDropClickHandler = () => {
    closeMovieModal();
    closeDeleteMovieModal();
    clearMovieInput();
};

// const cancelMovieDeletion = () => {
//     toggleBackDrop();
//     deleteMovieModal.classList.remove('visible');
// };

// const closeBackDrop = () => {
//     backdrop.classList.remove("visible");

// };

startAddMovieButton.addEventListener('click', showMovieModal);

//to close the backdrop when the backdrop is already opened
backdrop.addEventListener('click', backDropClickHandler);

cancelAddMovieButton.addEventListener('click', cancelAddMovieHandler);
confirmAddMovieButton.addEventListener('click',addMovieHandler);