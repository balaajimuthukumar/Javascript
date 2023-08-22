const RECIPEURL = 'https://forkify-api.herokuapp.com/api/v2/recipes';
const APIKEY = 'db231eab-b935-4414-aa9c-3b6a591df0f4';

const recipe = document.querySelector("#recipe_");
const leftContainer = document.querySelector(".container_left");
const searchBtn = document.getElementById("searchRecipes");
const rightContainer = document.querySelector(".container_right");
const paginationFwdBtn = document.getElementById("btnForward");
const paginationBwdBtn = document.getElementById("btnBackWard");
const backdrop = document.getElementById("backdrop");
const addRecipe = document.querySelector(".add_recipe");
const addRecipeModal = document.querySelector(".add_recipe_modal");
const formUpload = document.querySelector(".add_recipe_form");
const bookMark = document.querySelector(".nav_list");
const bookMarkContainer = document.querySelector(".bookmark_list_container");

const bookmarkItemJson = {
    anchor:{
        id:""
    }, list:{
        id:"recipe_"
    }, img:{
        imageurl:""
    }, h3:{
        textcontent:""
    }, p:{
        textcontent:""
    }
}

let searchResults = {};
let pageCount = 0;
let pageStart = 0;
let pageEnd = 0;
let selectedItem = {};//recipe that is currently being shown

async function fetchRecipe (searchParameter){
    const url = `${RECIPEURL}?search=${searchParameter}`;
    const recipes = await fetch(url,{method:'GET',headers:{"Content-type":"application/json"}});

    const result = await recipes.json();

    if(result.results == 0)
        throw {message:"No recipes found for your query! Please try again ;)"};

    return result.data;
}

function createDOMUtility(ele, attr,id){
    const element = document.createElement(ele); 

    //convert the object to the key value pairs
    for(const [name,value] of Object.entries(attr)){
        if(name.toUpperCase() == 'textContent'.toUpperCase()){
            element.textContent = value;
        }else{
            element.setAttribute(name,value);
        } 
    }

    //to set data attribute for the anchor link for the recipes in left nav
    if (ele == 'a')
        element.dataset.id = id;


    return element;
}

function paginateRecipes(pageNum, noOfElements){
    let len = searchResults.recipes.length/noOfElements;

    //when the values are decimal, additional page is added using below logic
    pageCount = (parseInt(len) < (len))?parseInt(len + 1):parseInt(len);
    pageStart = (pageNum - 1) * noOfElements;
    pageEnd = (noOfElements * pageNum);

    return searchResults.recipes.slice(pageStart, pageEnd);
}

function populateRecipe(result, pageNum, noOfElements){
    searchResults = result;
    //to reset the left container and reload all items for every click event or refresh
    leftContainer.innerHTML = '';

    const ol = createDOMUtility('ol', {class:"recipe_list"});

    const pagedRecipes = paginateRecipes(pageNum, noOfElements);
    for(const recipe of pagedRecipes){
        const li = createDOMUtility( 'li', {id : "recipe_"});
        const figure = createDOMUtility('figure', {class:"recipe_data_container"});
        const img = createDOMUtility( 'img',{src : recipe.image_url, width:'50px', height:'50px'});

        figure.appendChild(img);

        const recipeClickable = createDOMUtility( 'a', {href : "#",class : "recipe_anchor"}, recipe.id);
        
        const hIntro = createDOMUtility('h3',{class : "recipe_heading", id : recipe.id});
        hIntro.innerHTML = `${recipe.title}`;

        const pDesc = createDOMUtility('p',{class : "recipe_desc", textContent : recipe.publisher});

        const recipeDataContainer = createDOMUtility('div', {class : "recipe_data_container"} );
        recipeDataContainer.append(hIntro, pDesc);

        li.append(figure,recipeDataContainer);
        recipeClickable.appendChild(li)
        ol.appendChild(recipeClickable);
        leftContainer.appendChild(ol);
    }
    const anchorTags = document.getElementsByClassName("recipe_anchor");

    Array.from(anchorTags).forEach((ele)=>{
        addEventListenerShowRecipe(ele);
    });
}

async function showRecipe(searchParameter){
    const url = `${RECIPEURL}/${searchParameter}`;
    const recipes = await fetch(url,{method:'GET', headers:{"Content-type":"application/json"}});
    const response = await recipes.json();

    rightContainer.innerHTML = '';

    const ol =  createDOMUtility('ol',{class:"recipe_item"});

    const fig = createDOMUtility('figure',{class:"recipe_details"});
    selectedItem = response.data.recipe;
    selectedItem.ingredients.forEach(
        (ele)=>{
            const li = document.createElement('li');
            li.textContent = ((ele.quantity != null)?ele.quantity:'') + ' ' + ele.description;

            ol.appendChild(li);
        }
    )

    const secondaryHeading = createDOMUtility('h2',{textcontent:"RECIPE INGREDIENTS",class:"ingredients_heading"});
    const secondaryHeading2 = createDOMUtility('h2',{textcontent:"HOW TO COOK IT"});

    const miniItemsContainer = createDOMUtility('div',{class:"miniItemsContainer"});
    const bookMarkElement = createDOMUtility('input',{class:"bookMarkButton",value:"BM",id:searchParameter,type:"button"});

    bookMarkElement.addEventListener('click',(e)=>{
        if(localStorage.hasOwnProperty(e.target.id)){
            localStorage.removeItem(e.target.id);
            const ele = document.getElementById("recipe_"+e.target.id);
            ele.remove();
            document.querySelector(".empty_bookmark").style.display = "block";
        }else{
            const bmEle = document.querySelector(`[data-id="${e.target.id}"]`).cloneNode(true);
            bmEle.setAttribute("id","recipe_"+e.target.id);

            bookmarkItemJson.anchor.id = "recipe_"+e.target.id
            bookmarkItemJson.img.imageurl = bmEle.querySelector('img').src;
            bookmarkItemJson.h3.textcontent = bmEle.querySelector('h3').innerText;
            bookmarkItemJson.p.textcontent = bmEle.querySelector('p').innerText;
            addEventListenerShowRecipe(bmEle);

            localStorage.setItem(e.target.id,JSON.stringify(bookmarkItemJson));
            document.querySelector(".empty_bookmark").style.display = "none";
            document.querySelector(".bookmarked").appendChild(bmEle);
        }
    });
    
    const buttonInc = createDOMUtility('input', {class:"servings_counter", value:"+", type:"button"});
    const buttonDec = createDOMUtility('input', {class:"servings_counter", value:"-", type:"button"});

    buttonInc.addEventListener('click',counterFn);
    buttonDec.addEventListener('click',counterFn);

    const labelsServings = createDOMUtility('span', {class:"servings_label", textContent:response.data.recipe.servings + " SERVINGS"});
    const labelsServingsContainer = createDOMUtility('div', {class:"servings_label_container"});
    labelsServingsContainer.append(labelsServings, buttonInc, buttonDec);
    const cookingTime = createDOMUtility('div', {class:"cooking_time_label", textContent:response.data.recipe.cooking_time + " Minutes"});
    miniItemsContainer.append(cookingTime, labelsServingsContainer, bookMarkElement);
    const ingredientsContainer = createDOMUtility('div', {id:"ingredients_container"});
    ingredientsContainer.append(secondaryHeading, ol);

    const info = createDOMUtility('p', {id:"how_to_cook"});
    info.innerHTML = `This recipe was carefully designed and tested by <b>${response.data.recipe.publisher}</b>. Please check out directions at their website.`;

    const img = createDOMUtility('img', {src:`${response.data.recipe.image_url}`, width:"100%", height:"100%"})
    fig.appendChild(img);
    
    const howToCookContainer = createDOMUtility('div', {class:"htc_container"});
    howToCookContainer.append(secondaryHeading2, info);

    rightContainer.append(fig, miniItemsContainer, ingredientsContainer, howToCookContainer);
}

function paginationBtnHandler(pageNum){
    paginationBwdBtn.style.display = "block";
    paginationFwdBtn.style.display = "block";

    if(pageNum == pageCount){
        paginationFwdBtn.style.display = "none";
        paginationBwdBtn.innerHTML = '<--Page ' + (pageNum - 1);
        paginationFwdBtn.innerHTML = 'Page ' + (pageNum + 1) + '-->';
    }else{
        paginationBwdBtn.style.display = "block";
        
        paginationFwdBtn.style.display = "block";
        paginationFwdBtn.innerHTML = 'Page ' + (pageNum + 1) + '-->';

        if(pageNum == 1){
            paginationBwdBtn.style.display = "none";
            paginationBwdBtn.innerHTML = 'Page ' + 0 + '-->';
        }else{
            paginationBwdBtn.innerHTML = '<--Page ' + (pageNum - 1);  
        }       
    }
}

paginationFwdBtn.addEventListener('click', function(){
    let btnName = this.innerText;
    paginationBtnHandler(parseInt(btnName[btnName.length - 4]));
    populateRecipe(searchResults,parseInt(btnName[btnName.length - 4]), 10);
});

paginationBwdBtn.addEventListener('click', function(){
    let btnName = this.innerText;
    paginationBtnHandler(parseInt(btnName[btnName.length - 1]));
    populateRecipe(searchResults,parseInt(btnName[btnName.length - 1]), 10);
});

function backdropBtnHandler(){
    addRecipeModal.style.display = "flex";
    backdrop.classList.toggle("visible");
}

function closeAddRecipeModal(){
    addRecipeModal.style.display = "none";
    backdrop.classList.remove("visible");
    formUpload.reset();
}

async function uploadRecipe(formData){
    let ing = [];
    const {title,source_url,image_url,publisher,cooking_time,servings, ...remainingProperties} = formData;

    for(const obj in remainingProperties){
        let elArray = formData[obj].split(",");
        console.log(elArray);
        if(elArray.length != 3 || (elArray[2] == ''))
            throw {message:"Wrong ingredient fromat! Please use the correct format :)"}

        ing.push({quantity:elArray[0],unit:elArray[1],description:elArray[2]});        
    }
    
    const postData = {
        title:formData.title,
        source_url:formData.source_url,
        image_url:formData.image_url,
        publisher:formData.publisher,
        cooking_time:formData.cooking_time,
        servings:formData.servings,
        ingredients:ing
    }

    const response = await fetch(`${RECIPEURL}?key=${APIKEY}`,{method:'POST',body:JSON.stringify(postData),headers:{"Content-type":"application/json"}});
    return response.json();
}

function counterFn(){
    const labelVal = document.querySelector(".servings_label");
    const serv = labelVal.innerHTML.trim().split(" ");
    const servingsOrg = parseInt(serv[0]);
    serv[0] = (this.value == '+')?parseInt(serv[0])+1:serv[0]-1;

    labelVal.innerHTML = serv.join(" ");
    editRecipeIngredients(parseInt(serv[0]),servingsOrg);
}

function editRecipeIngredients(qty, servings){
    const ol = document.querySelector('.recipe_item');

    selectedItem.ingredients.forEach((ele,idx)=>{
        let qt = 0;
        const replaceNode = ol.childNodes[idx].cloneNode(true);
        if(ele.quantity != null){
            ele.quantity = (ele.quantity * qty)/servings;

            replaceNode.textContent = math.fraction(ele.quantity).toFraction(true) + ' ' + ele.description;
            
            ol.replaceChild(replaceNode,ol.childNodes[idx]);
        }
    });
}

function populateBookmark(){
    let locStrg = {...localStorage};

    if(locStrg.length > 0)
        document.querySelector(".empty_bookmark").style.display = "none";
    else
        document.querySelector(".empty_bookmark").style.display = "block";

    for(const obj in locStrg){
        let objJSON = JSON.parse(localStorage.getItem(obj));
        
        bookMarkContainer.firstElementChild.insertAdjacentHTML('beforeend', `
        <a href="#" class="recipe_anchor" data-id="${objJSON.anchor.id.split('_')[1]}" id="${objJSON.anchor.id}">
            <li id="recipe_">
                <figure class="recipe_data_container">
                    <img src="${objJSON.img.imageurl}" width="50px" height="50px">
                </figure>
                <div class="recipe_data_container">
                    <h3 class="recipe_heading" id="${objJSON.anchor.id.split('_')[1]}">${objJSON.h3.textcontent}</h3>
                    <p class="recipe_desc">${objJSON.p.textcontent}</p>
                </div>
            </li>
        </a>
        `);

        addEventListenerShowRecipe(bookMarkContainer.firstElementChild.lastElementChild);
    }
}

function addEventListenerShowRecipe(obj){
    obj.addEventListener('click',(e)=>{
        showRecipe(e.currentTarget.dataset.id);
    });
}

searchBtn.addEventListener('click',() => {
    const searchParameter = document.getElementById("searchInp").value;
    if(searchParameter != ''){
        fetchRecipe(searchParameter).then((response)=>{
            populateRecipe(response, 1, 10);
            paginationBtnHandler(1);
        }).catch((error)=>{//searching bad data validation
            console.log(error);
        });
    }
});

backdrop.addEventListener('click',closeAddRecipeModal);

addRecipe.addEventListener('click',backdropBtnHandler);

formUpload.addEventListener('submit',function(e){
    e.preventDefault();

    let formData = [...new FormData(this)];
    uploadRecipe(Object.fromEntries(formData))
    .catch((err)=>{//input fields validation
        console.log(err);
    }).then((response)=>{
        console.log(response);
    });
});

bookMark.addEventListener('mouseover',function(e){    
    document.querySelector(".bookmark_list_container").style.display = "block";
});

bookMarkContainer.addEventListener('mouseover',function(e){    
    document.querySelector(".bookmark_list_container").style.display = "block";
});

bookMark.addEventListener('mouseout',function(e){    
    document.querySelector(".bookmark_list_container").style.display = "none";
});

bookMarkContainer.addEventListener('mouseout',function(e){    
    document.querySelector(".bookmark_list_container").style.display = "none";
});

populateBookmark();
