//***SELECT ITEMS***//

const colorsBtn = document.querySelectorAll(".color-circle");
const resultsContainer = document.querySelector(".thread-items-wrapper");
const searchInput = document.querySelector(".search-term");
const btnSearch = document.getElementById("search");
const shoppingContainer = document.querySelector('.shopping-items-wrapper');
const boxContainer = document.querySelector('.box-items-wrapper');
const noFound = document.querySelector('.no-found');
const prevBtn = document.querySelector('.fa-chevron-left');
const nextBtn = document.querySelector('.fa-chevron-right');
const searchContainer = document.querySelector('.search-container');


//***REQUETES LOCAL SERVER***//

async function getDMCData(){
    const resp = await fetch("http://localhost:5000/data.json");
    const respData = await resp.json();
    return respData;
}

//***FONCTIONALITIES ***//

//SEARCH BY COLOUR
colorsBtn.forEach(colorBtn => {
    colorBtn.addEventListener('click', async (e)=> {
        resultsContainer.innerHTML = '';
        noFound.classList.remove('active');
        searchInput.value = '';
        const idColor = e.currentTarget.dataset.id;
        const categoryArray = await getCategoryArray(idColor);
        addItem(categoryArray, resultsContainer);
    })
})

async function getCategoryArray(id){
    const DMCArray = await getDMCData();
    const categoryArray = DMCArray.filter(element => {
        return element.category === id;
    })
    return categoryArray;
}

function addItem(arr, container){
    for(let i = 0; i < arr.length; i++){
        const threadItem = document.createElement("div");
        threadItem.classList.add("thread-item");
        threadItem.dataset.colorOrder = `${arr[i].order}`;
        threadItem.innerHTML = `
        <div class="item-background">
        <img class="img-color-thread" src="https://static1.dmc.com/cache/1/1/117mc_e_${arr[i].code}_swatch_150x150.jpg" alt="">
    <button class="clear"><i class="fas fa-times"></i></button>
    <p>${arr[i].code}</p>
    <div class="action-box">
        <i class="fas fa-shopping-basket"></i>
        <i class="fas fa-archive"></i>
        <span class="line"></span>
    </div></div>`;
        container.appendChild(threadItem);
    } 
    
    const btnsClear = document.querySelectorAll('.fa-times');
    btnsClear.forEach(btnClear => {
        btnClear.addEventListener('click', clearItem);
    })

    const btnsShop = document.querySelectorAll('.fa-shopping-basket');
    btnsShop.forEach(btnShop => {
        btnShop.addEventListener('click', addShopItem);
    })

    const btnsBox = document.querySelectorAll('.fa-archive');
    btnsBox.forEach(btnBox => {
        btnBox.addEventListener('click', addBoxItem);
    })
}

//remove an item form search
function clearItem(e){
    const item = e.currentTarget.parentElement.parentElement.parentElement;
    const parentItem = item.parentElement;
    parentItem.removeChild(item);
};

//ADD ITEM TO SHOP LIST

function addShopItem(e){
    //ajout item au shopping-container
    const itemToAdd = e.currentTarget.parentElement.parentElement.parentElement;
    const cloneItem = itemToAdd.cloneNode(true);
        //ajout btn clear form LS and shopping-container
        const btnClearLS = cloneItem.querySelector(".fa-times");
        btnClearLS.classList.add('clearLS');
    shoppingContainer.appendChild(cloneItem);
    //ajout item au LS
    const code = cloneItem.querySelector(".item-background p").innerHTML;
    const order = cloneItem.dataset.colorOrder;
    addToLSShop({code, order});
    //btn supp item du LS et Shopping List
    btnClearLS.addEventListener('click', clearShopItem);
}

function clearShopItem(e){
    clearItem(e);
    const itemSelected = e.currentTarget.parentElement.parentElement;
    const code = itemSelected.querySelector(".item-background p").innerHTML;
    removeFromLSShop(code);
}

//ADD ITEM TO BOX LIST

function addBoxItem(e){
    //ajout item au shopping-container
    const itemToAdd = e.currentTarget.parentElement.parentElement.parentElement;
    const cloneItem = itemToAdd.cloneNode(true);
        //ajout btn clear from LS and box-container
        const btnClearLS = cloneItem.querySelector(".fa-times");
        btnClearLS.classList.add('clearLS');
    boxContainer.appendChild(cloneItem);
    //ajout item au LS
    const code = cloneItem.querySelector(".item-background p").innerHTML;
    const order = cloneItem.dataset.colorOrder;
    addToLSBox({code, order});
    //supp item du LS et Box List
    btnClearLS.addEventListener('click', clearBoxItem);
}

function clearBoxItem(e){
    clearItem(e);
    const itemSelected = e.currentTarget.parentElement.parentElement;
    const code = itemSelected.querySelector(".item-background p").innerHTML;
    removeFromLSBox(code);
}

//SEARCH BY CODE

btnSearch.addEventListener('click', async ()=> {
    resultsContainer.innerHTML = '';
    noFound.classList.remove('active');
    const codeValue = searchInput.value;
    const itemByCode = await getItemByCode(codeValue);
    addItem(itemByCode,resultsContainer);
})

async function getItemByCode(codeSearched){
    const DMCArray = await getDMCData();
    const codeItem = DMCArray.filter(item => {
        return item.code === codeSearched;
    })
    if(codeItem.length === 0){
        noFound.classList.add('active');
    }else {
        return codeItem;
    }
}

//***LOCAL STORAGE***//

function getLocalStorage(LSname){
    const dataLS = localStorage.getItem(LSname);
    if (dataLS === null){
        return [];
    } else {
        return JSON.parse(dataLS);
    }
}

function addToLSShop(item){
    const arrayLS = getLocalStorage('shoppingList');
    arrayLS.push(item);
    //tri par ordre de couleurs
    const sortedArray = arrayLS.sort((a, b)=> {
        return a.order - b.order
    })
    localStorage.setItem('shoppingList', JSON.stringify(sortedArray))
}

function removeFromLSShop(itemCode){
    const arrayLS = getLocalStorage('shoppingList');
    const newArray = arrayLS.filter(value => {
        return value.code !== itemCode
    });
    localStorage.setItem('shoppingList', JSON.stringify(newArray))
}

function addToLSBox(item){
    const arrayLS = getLocalStorage('boxList');
    arrayLS.push(item);
    //tri par ordre de couleurs
    const sortedArray = arrayLS.sort((a, b)=> {
        return a.order - b.order
    })
    localStorage.setItem('boxList', JSON.stringify(sortedArray))
}

function removeFromLSBox(itemCode){
    const arrayLS = getLocalStorage('boxList');
    const newArray = arrayLS.filter(value => {
        return value.code !== itemCode
    });
    localStorage.setItem('boxList', JSON.stringify(newArray))
}

//***SET ITEMS STORED***//

window.addEventListener("DOMContentLoaded", setupShopItems);
window.addEventListener("DOMContentLoaded", setupBoxItems);

function setupShopItems(){
    let items = getLocalStorage('shoppingList');
    if(items.length > 0){
        addItem(items, shoppingContainer);
    }
}

function setupBoxItems(){
    let items = getLocalStorage('boxList');
    if(items.length > 0){
        addItem(items, boxContainer);
    }
}

//***CAROUSSEL***//

let counter = 0;
const carouselWidth = searchContainer.offsetWidth;
prevBtn.style.display = 'none';

nextBtn.addEventListener('click', ()=>{
    counter++;
    carousel();
});
prevBtn.addEventListener('click', ()=>{
    counter--;
    carousel();
});

function carousel(){
    if(carouselWidth === 900 && counter < 1){
        nextBtn.style.display = 'block';
    }else if(carouselWidth === 520 && counter < 2){
        nextBtn.style.display = 'block';
    }else{
        nextBtn.style.display = 'none';
    }
    if(counter > 0){
        prevBtn.style.display = 'block';
    }else{
        prevBtn.style.display = 'none';
    }
    if(carouselWidth === 900){
        colorsBtn.forEach(color =>{
            color.style.transform = `translateX(-${counter * 270}%)`;
        })
    }else if(carouselWidth === 520){
        colorsBtn.forEach(color =>{
            color.style.transform = `translateX(-${counter * 385}%)`;
        })
    }
}


//***TO DO ***/
//CSS ajout effet hover icones
//refactoriser add shop item add box item
//bug muted green
//generer les couleurs du nuancier automatiquement
