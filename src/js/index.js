import Search from './models/Search';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';
import Recipe from './models/Recipe';

// Global State of the app
/*
Search object 
current recipe object 
shopping list objects
liked recepies
*/
const state = {};

const controlSearch = async () => {
    // 1- get the query from the view 
    const query = searchView.getInput();
    console.log(query);

    if(query) {
        // 2- new search object and add to state
        state.search = new Search(query);

        // 3- prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4- search for recepies 
            await state.search.getResults();

            // 5- render result on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch(err) {
            alert("Error Occured!");
            clearLoader();
        }
        

    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        console.log(goToPage);
    }
});

const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if(id) {
    state.recipe = new Recipe(id);
    
    try{
        await state.recipe.getRecipe();
        state.recipe.calcTime();
        state.recipe.calcServings();
    
        console.log(state.recipe);
    } catch(error) {
       alert('Some Error occured!');
    }
   
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));