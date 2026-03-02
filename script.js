const inputEl = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const spinnerEl = document.getElementById('loading-spinner');
const countryInfoEl = document.getElementById('country-info');
const bordersEl = document.getElementById('bordering-countries');
const errorEl = document.getElementById('error-message');

function show(el) {
    el.classList.remove('hidden');
}

function hide(el) {
    el.classList.add('hidden');
}

function setError(message) {
    errorEl.textContent = message;
    show(errorEl);
}

function clearError() {
    errorEl.textContent = '';
    hide(errorEl);
}

async function searchCountry(countryName) {
    const name = countryName.trim();

    clearError();
    hide(countryInfoEl);
    hide(bordersEl);
    bordersEl.innerHTML = '';
    countryInfoEl.innerHTML = '';

    if (!name) {
        setError("Please enter a country name.");
        return;
    }

    try {
        show(spinnerEl);

        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`);
        if (!response.ok) {
            throw new Error("Country not found");
        }

        const data = await response.json();
        const country = data[0];

        
        countryInfoEl.innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : "N/A"}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <img src="${country.flags.svg}" alt="${country.name.common} flag">
        `;

        show(countryInfoEl);

      
        if (!country.borders || country.borders.length === 0) {
            bordersEl.innerHTML = `
                <p><strong>No bordering countries.</strong></p>
            `;
            show(bordersEl);
        } else {
            const borderPromises = country.borders.map(code =>
                fetch(`https://restcountries.com/v3.1/alpha/${code}`)
                    .then(res => res.json())
            );

            const borderResults = await Promise.all(borderPromises);

            const borderHTML = borderResults.map(result => {
                const neighbor = result[0];
                return `
                    <article class="border-item">
                        <img src="${neighbor.flags.svg}" alt="${neighbor.name.common} flag">
                        <p>${neighbor.name.common}</p>
                    </article>
                `;
            }).join('');

            bordersEl.innerHTML = borderHTML;
            show(bordersEl);
        }

    } catch (error) {
        setError("Country not found. Please try again.");
    } finally {
        hide(spinnerEl);
    }
}


searchBtn.addEventListener('click', () => {
    searchCountry(inputEl.value);
});


inputEl.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        searchCountry(inputEl.value);
    }
});