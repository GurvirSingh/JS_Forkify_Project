import axios from 'axios';

export default class Reciep {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch(error) {
            console.log(error);
            alert('something went wrong');
        }
    }

    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoon', 'tablespoons', 'ounce', 'ounces', 'teaspoon', 'teaspoons', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        const newIngredients = this.ingredients.map(el => 
            {
                // Uniform units
                let ingredient = el.toLowerCase();
                unitsLong.forEach((unit, i) => {
                    ingredient = ingredient.replace(unit, unitsShort[i]);
                });
                // Remove parentheses
                ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

                // Parese ingredients into count unit and ingredient
                const arrIng = ingredient.split(' ');
                const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

                let objIng;
                if(unitIndex > -1) {
                    // There is a unit

                    // Example 4 1/2 cups, arrCoutn is[4, 1/2]--> eval("4+1/2") op: 4.5
                    // Example 4 cups, arrCoutn is [4]

                    const arrCount = arrIng.slice(0, unitIndex);

                    let count;
                    if(arrCount.length === 1) {
                        count = eval(arrIng[0].replace('-', '+'));
                    } else {
                        count = eval(arrIng.slice(0, unitIndex).join('+'));
                    }

                    objIng = {
                        count,
                        unit: arrIng[unitIndex],
                        ingredient: arrIng.slice(unitIndex + 1).join(' ')
                    };

                    

                } else if(parseInt(arrIng[0], 10)) {
                    // There is no unit, but 1st element is a number
                    objIng = {
                        count: parseInt(arrIng[0], 10),
                        unit: '',
                        ingredient: arrIng.slice(1).join(' ')
                    }

                } else if(unitIndex === -1) {
                    // There is no unit
                    objIng = {
                        count: 1,
                        unit: '',
                        ingredient //automatically create
                    }
                }

                return objIng;
            });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        // Update servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        
        // Update Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}

