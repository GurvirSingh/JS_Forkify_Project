import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

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
        // console.log(goToPage);
    }
});

const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    // console.log(id);

    if(id) {
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        
        if(state.search)
        searchView.highlightSelected(id);

        state.recipe = new Recipe(id);
    
    try{
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();
        state.recipe.calcTime();
        state.recipe.calcServings();
    
        clearLoader();
        recipeView.renderRecipe(
            state.recipe, 
            state.likes.isLike(id)
        );

    } catch(error) {
       alert('Some Error occured!' + error);
    }
   
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// List controller 
const controlList = () => {
    if(!state.list) state.list = new List();

    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
}

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);

        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    } 
    
});

// Like controller
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;
    // has not liked
    if(!state.likes.isLike(currentId)) {
        // has liked
        const newLike = state.likes.addLike(
            currentId, 
            state.recipe.title, 
            state.recipe.author, 
            state.recipe.img
            );
        // toggle like button
        likesView.toggleLikeBtn(true);
        likesView.renderLike(newLike);
        
        // console.log(state.likes);
        
        
    } else {
        // remove like 
        state.likes.deleteLike(currentId);
        likesView.toggleLikeBtn(false);

        // console.log(state.likes);
        likesView.deleteLikes(currentId);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// each time the page loads sotre recipies in the likes 
window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();

    likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLike(like));
})



// Handling recipe buttons 
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease button clicked
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
        }
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
}); 