const categoriesMenu = document.getElementById("categoriesMenu");
        const categoriesGrid = document.getElementById("categoriesGrid");
        const categoriesGridUnderMeal = document.getElementById("categoriesGridUnderMeal");
        const sideMenu = document.getElementById("sideMenu");
        const menuBtn = document.getElementById("menuBtn");
        const closeMenu = document.getElementById("closeMenu");
        const homeSection = document.getElementById("homeSection");
        const categorySection = document.getElementById("categorySection");
        const categoryDescription = document.getElementById("categoryDescription");
        const mealsContainer = document.getElementById("mealsContainer");
        const mealDetailsSection = document.getElementById("mealDetailsSection");
        const mealDetails = document.getElementById("mealDetails");

        menuBtn.addEventListener("click", () => sideMenu.style.right = "0");
        closeMenu.addEventListener("click", () => sideMenu.style.right = "-16rem");

        async function loadCategories() {
            const url = "https://www.themealdb.com/api/json/v1/1/categories.php";
            const res = await fetch(url);
            const data = await res.json();
            categoriesMenu.innerHTML = "";
            categoriesGrid.innerHTML = "";
            categoriesGridUnderMeal.innerHTML = "";

            data.categories.forEach(cat => {
                const li = document.createElement("li");
                li.textContent = cat.strCategory;
                li.className = "cursor-pointer border-bottom pb-1 mb-1";
                li.onclick = () => loadCategory(cat.strCategory);
                categoriesMenu.appendChild(li);

                const cardHome = document.createElement("div");
                cardHome.className = "col-6 col-sm-4 col-md-3";
                cardHome.innerHTML = `
                    <div class="card shadow-sm h-100 cursor-pointer position-relative">
                    <img src="${cat.strCategoryThumb}" class="card-img-top" alt="${cat.strCategory}" />
                    <span class="fw-bold"
                        style="position: absolute; background-color: orange; color: white; padding: 2px 5px; top: 10px; right: 10px; border-radius: 4px;">
                        ${cat.strCategory}
                    </span>
                </div>
                `;
                cardHome.querySelector("div").onclick = () => loadCategory(cat.strCategory);
                categoriesGrid.appendChild(cardHome);

                const cardMeal = cardHome.cloneNode(true);
                cardMeal.querySelector("div").onclick = () => loadCategory(cat.strCategory);
                categoriesGridUnderMeal.appendChild(cardMeal);
            });
        }

        async function loadCategory(category) {
            homeSection.classList.add("d-none");
            categorySection.classList.remove("d-none");
            mealDetailsSection.classList.add("d-none");

            const catUrl = "https://www.themealdb.com/api/json/v1/1/categories.php";
            const res = await fetch(catUrl);
            const data = await res.json();
            const cat = data.categories.find(c => c.strCategory === category);
            if (cat) {
                categoryDescription.innerHTML = `
                    <div class="card p-3 mb-3 shadow-sm">
                        <h2 class="text-warning fw-bold">${cat.strCategory}</h2>
                        <p>${cat.strCategoryDescription}</p>
                    </div>
                `;
            }

            const mealsUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`;
            const resMeals = await fetch(mealsUrl);
            const mealsData = await resMeals.json();
            mealsContainer.innerHTML = "";
            (mealsData.meals || []).forEach(meal => {
                const card = document.createElement("div");
                card.className = "custom-col-5";
                card.innerHTML = `
                    <div class="card shadow-sm h-100 cursor-pointer">
                        <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}" width="200px" height="300px" style="object-fit: cover;"/>
                        <div class="card-body p-2">
                            <p class="fw-bold">${meal.strMeal}</p>
                        </div>
                    </div>
                `;
                card.querySelector("img").onclick = () => loadMealDetails(meal.idMeal);
                mealsContainer.appendChild(card);
            });
        }

        async function loadMealDetails(id) {
            homeSection.classList.add("d-none");
            categorySection.classList.add("d-none");
            mealDetailsSection.classList.remove("d-none");

            const mealUrl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
            const res = await fetch(mealUrl);
            const data = await res.json();
            const meal = data.meals?.[0];
            if (!meal) return;

            document.getElementById("mealTitle").textContent = meal.strMeal;

            let ingredientsHTML = "";
            let measuresHTML = "";
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== "") {
                    ingredientsHTML += `<div class="ingredient-item">${ingredient}</div>`;
                    measuresHTML += `<div class="measure-item"><i class="fa fa-utensil-spoon" style="color: red;"></i> ${measure || ""} ${ingredient}</div>`;
                }
            }

            const steps = meal.strInstructions.split(/\r?\n+/).flatMap(line => line.split(/\. (?=[A-Z])/)).map(s => s.trim()).filter(s => s.length > 2);
            const instructionsHTML = steps.map(s => `
                <li class="d-flex align-items-start gap-2 mb-1">
                    <span class="d-flex justify-content-center align-items-center rounded-circle" style="width:24px;height:24px;color: orange;">
                        <i class="fa-regular fa-square-check"></i>
                    </span>
                    <span>${s}</span>
                </li>`).join("");

            const srcLink = meal.strSource ? `<a href="${meal.strSource}" target="_blank" class="text-primary text-decoration-none">${meal.strSource}</a>` : `<span class="text-muted">Source: Not available</span>`;

            mealDetails.innerHTML = `
                <div class="row g-3">
                    <div class="col-12 col-lg-6">
                        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid" />
                    </div>
                   
                    <div class="col-12 col-lg-6">
                        <h3 class="fw-bold mb-2" style="display: inline-block; color: orange; padding: 4px 8px; border-radius: 4px; border-bottom: 3px solid orange;">
                            ${meal.strMeal}
                        </h3>
                        <p><strong>Category:</strong> ${meal.strCategory || "—"}</p>
                        <p><strong>Tags:</strong>
                            ${meal.strTags ? meal.strTags.split(',').map(t=>`<span style="border:1px solid orange; padding:2px 5px; display:inline-block; margin-right:3px;">${t}</span>`).join('') : 'None'}
                        </p>
                        <p><strong>Area:</strong> ${meal.strArea || "—"}</p>
                        <p><strong>Source:</strong> ${srcLink}</p>
                        <div class="ingredients-container mt-3">
                            <h4>Ingredients</h4>
                            ${ingredientsHTML}
                        </div>
                    </div>
                </div>
                <br>
                 <div class="measures-container">
                            <h4>Measures</h4>
                            ${measuresHTML || '<span class="text-muted">No measures available</span>'}
                        </div>
                <div class="mt-4">
                    <h4 class="fw-semibold">Instructions</h4>
                    <ul class="list-unstyled mt-2">${instructionsHTML}</ul>
                </div>
            `;

            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        document.getElementById("homeIcon").addEventListener("click", () => {
            mealDetailsSection.classList.add("d-none");
            homeSection.classList.remove("d-none");
            categorySection.classList.add("d-none");
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        async function searchMeal() {
            const query = document.getElementById("searchInput").value.trim();
            if (!query) return;
            homeSection.classList.add("d-none");
            categorySection.classList.remove("d-none");
            mealDetailsSection.classList.add("d-none");
            mealsContainer.innerHTML = "";

            const searchUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
            const res = await fetch(searchUrl);
            const data = await res.json();
            if (!data.meals) {
                mealsContainer.innerHTML = `<div class="alert alert-warning">No results found for "${query}"</div>`;
                return;
            }
            data.meals.forEach(meal => {
                const card = document.createElement("div");
                card.className = "col-12 col-sm-6 col-md-4";
                card.innerHTML = `
                    <div class="card shadow-sm h-100 cursor-pointer">
                        <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}"/>
                        <div class="card-body p-2">
                            <h5 class="fw-bold">${meal.strMeal}</h5>
                        </div>
                    </div>
                `;
                card.querySelector("img").onclick = () => loadMealDetails(meal.idMeal);
                mealsContainer.appendChild(card);
            });
        }

        document.getElementById("searchBtn").addEventListener("click", searchMeal);
        document.getElementById("searchInput").addEventListener("keypress", e => { if(e.key === "Enter") searchMeal(); });

        loadCategories();
  