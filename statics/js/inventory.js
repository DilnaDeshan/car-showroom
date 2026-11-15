const vehicleGrid = document.getElementById('vehicle_grid');
let vehicleCards = [];
const searchInput = document.getElementById('inv_searchbar');
const yearFilter = document.getElementById('inv_year');
const typeFilter = document.getElementById('inv_type');
const brandFilter = document.getElementById('inv_brand');
const sortControl = document.getElementById('inv_sort');
const vehicleCount = document.getElementById('inventory_count');
const emptyMessage = document.getElementById('empty_message');
const priceFilterToggle = document.getElementById('price_filter_toggle');
const priceFilterPanel = document.getElementById('price_filter_panel');
const priceFilterLabel = document.getElementById('price_filter_label');
const minPriceInput = document.getElementById('min_price');
const maxPriceInput = document.getElementById('max_price');
const priceError = document.getElementById('price_error');
const pricePills = Array.from(document.querySelectorAll('.price-pill'));
let appliedPriceRange = null;
let inventoryRequestInProgress = false;

function filterValue(value) {
    return value.trim().toLowerCase();
}

function populateFilter(select, values, placeholder) {
    const selectedValue = select.value;
    select.replaceChildren(new Option(placeholder, ''));

    values.forEach((value) => {
        const option = new Option(value, filterValue(String(value)));
        select.appendChild(option);
    });

    if (values.some((value) => filterValue(String(value)) === selectedValue)) {
        select.value = selectedValue;
    }
}

function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    return element;
}

function createVehicleCard(vehicle) {
    const make = String(vehicle.make);
    const brand = String(vehicle.brand);
    const model = String(vehicle.model);
    const type = String(vehicle.type);
    const color = String(vehicle.color);
    const engine = String(vehicle.engine);
    const price = Number(vehicle.price);
    const card = document.createElement('article');
    card.className = 'vehicle-card';
    card.dataset.name = `${make} ${model}`;
    card.dataset.year = String(vehicle.year);
    card.dataset.type = filterValue(type);
    card.dataset.vehicleType = type;
    card.dataset.brand = filterValue(brand);
    card.dataset.price = String(price);
    card.dataset.id = String(vehicle.id);
    card.dataset.make = make;
    card.dataset.model = model;
    card.dataset.engine = engine;
    card.dataset.color = color;

    const photo = document.createElement('div');
    photo.className = 'vehicle-photo';
    const image = document.createElement('img');
    image.src = 'statics/image/backgroundimage-car.jpg';
    image.alt = `${make} ${model}`;
    image.addEventListener('error', () => {
        image.src = 'statics/image/backgroundimage-car.jpg';
    }, { once: true });
    const status = createTextElement('span', 'vehicle-status', 'In inventory');
    photo.append(image, status);

    const info = document.createElement('div');
    info.className = 'vehicle-info';
    const heading = document.createElement('div');
    heading.className = 'vehicle-heading';
    heading.append(
        createTextElement('h2', '', `${make} ${model}`),
        createTextElement('p', 'vehicle-price', `$${price.toLocaleString('en-US')}`)
    );

    const specs = document.createElement('div');
    specs.className = 'vehicle-specs';
    specs.append(
        createTextElement('span', '', `${vehicle.year} · ${engine}`),
        createTextElement('span', '', `${type} · ${color}`)
    );

    const actions = document.createElement('div');
    actions.className = 'vehicle-actions';
    const details = createTextElement('a', 'details-button', 'View Details');
    details.href = '#';
    details.setAttribute('role', 'button');
    const reserve = createTextElement('a', 'reserve-button', 'Reserve');
    reserve.href = 'reservation.html';
    actions.append(details, reserve);
    info.append(heading, specs, actions);
    card.append(photo, info);
    return card;
}

function renderVehicles(vehicles) {
    vehicleCards = vehicles.map(createVehicleCard);
    vehicleGrid.replaceChildren(...vehicleCards);

    const years = [...new Set(vehicles.map((vehicle) => Number(vehicle.year)))]
        .sort((first, second) => second - first);
    const types = [...new Set(vehicles.map((vehicle) => String(vehicle.type)))]
        .sort((first, second) => first.localeCompare(second));
    const brands = [...new Set(vehicles.map((vehicle) => String(vehicle.brand)))]
        .sort((first, second) => first.localeCompare(second));
    populateFilter(yearFilter, years, 'Year');
    populateFilter(typeFilter, types, 'Type');
    populateFilter(brandFilter, brands, 'Brand');
    updateInventory();
}

async function loadVehicles() {
    if (inventoryRequestInProgress) {
        return;
    }

    inventoryRequestInProgress = true;
    try {
        const response = await fetch('api/vehicles.php', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Inventory request failed (${response.status}).`);
        }

        const result = await response.json();
        if (!Array.isArray(result.vehicles)) {
            throw new Error(result.error || 'The inventory response was invalid.');
        }

        renderVehicles(result.vehicles);
        emptyMessage.textContent = 'No vehicles are currently listed.';
        emptyMessage.hidden = vehicleCards.length > 0;
        vehicleCount.removeAttribute('title');
    } catch (error) {
        console.error('Unable to load vehicle inventory:', error);
        if (vehicleCards.length === 0) {
            vehicleCount.textContent = 'Inventory unavailable';
            emptyMessage.textContent = 'Unable to load inventory. Please try again later.';
            emptyMessage.hidden = false;
        } else {
            vehicleCount.title = 'The latest refresh failed; showing previously loaded inventory.';
        }
    } finally {
        inventoryRequestInProgress = false;
    }
}

function matchesPriceRange(price) {
    return !appliedPriceRange
        || ((appliedPriceRange.min === null || price >= appliedPriceRange.min)
            && (appliedPriceRange.max === null || price <= appliedPriceRange.max));
}

function clearActivePricePills() {
    pricePills.forEach((pill) => pill.classList.remove('active'));
}

function setPriceRangeLabel(range) {
    if (!range) {
        priceFilterLabel.textContent = 'Price Range';
        return;
    }

    const formatPrice = (price) => `$${price.toLocaleString('en-US')}`;
    if (range.min === null) {
        priceFilterLabel.textContent = `Under ${formatPrice(range.max)}`;
    } else if (range.max === null) {
        priceFilterLabel.textContent = `Over ${formatPrice(range.min)}`;
    } else {
        priceFilterLabel.textContent = `${formatPrice(range.min)} - ${formatPrice(range.max)}`;
    }
}

function updateInventory() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const visibleCards = vehicleCards.filter((card) => {
        const price = Number(card.dataset.price);
        const matchesSearch = card.textContent.toLowerCase().includes(searchTerm);

        return matchesSearch
            && (!yearFilter.value || card.dataset.year === yearFilter.value)
            && (!typeFilter.value || card.dataset.type === typeFilter.value)
            && (!brandFilter.value || card.dataset.brand === brandFilter.value)
            && matchesPriceRange(price);
    });

    const sortBy = sortControl.value;
    if (sortBy) {
        visibleCards.sort((first, second) => {
            if (sortBy === 'price-low') {
                return Number(first.dataset.price) - Number(second.dataset.price);
            }
            if (sortBy === 'price-high') {
                return Number(second.dataset.price) - Number(first.dataset.price);
            }
            return Number(second.dataset.year) - Number(first.dataset.year);
        });
    }

    vehicleCards.forEach((card) => {
        card.hidden = !visibleCards.includes(card);
    });
    visibleCards.forEach((card) => vehicleGrid.appendChild(card));

    vehicleCount.textContent = `${visibleCards.length} ${visibleCards.length === 1 ? 'vehicle' : 'vehicles'}`;
    emptyMessage.hidden = visibleCards.length > 0;
}

function closePricePanel() {
    priceFilterPanel.hidden = true;
    priceFilterToggle.setAttribute('aria-expanded', 'false');
}

priceFilterToggle.addEventListener('click', () => {
    const isOpening = priceFilterPanel.hidden;
    priceFilterPanel.hidden = !isOpening;
    priceFilterToggle.setAttribute('aria-expanded', String(isOpening));
    if (isOpening) {
        minPriceInput.value = appliedPriceRange?.min ?? '';
        maxPriceInput.value = appliedPriceRange?.max ?? '';
        priceError.hidden = true;
    }
});

pricePills.forEach((pill) => {
    pill.addEventListener('click', () => {
        minPriceInput.value = pill.dataset.min;
        maxPriceInput.value = pill.dataset.max;
        clearActivePricePills();
        pill.classList.add('active');
        priceError.hidden = true;
    });
});

[minPriceInput, maxPriceInput].forEach((input) => {
    input.addEventListener('input', () => {
        clearActivePricePills();
        priceError.hidden = true;
    });
});

document.getElementById('price_reset').addEventListener('click', () => {
    minPriceInput.value = '';
    maxPriceInput.value = '';
    clearActivePricePills();
    priceError.hidden = true;
    appliedPriceRange = null;
    setPriceRangeLabel(appliedPriceRange);
    updateInventory();
});

document.getElementById('price_show').addEventListener('click', () => {
    const minValue = minPriceInput.value === '' ? null : Number(minPriceInput.value);
    const maxValue = maxPriceInput.value === '' ? null : Number(maxPriceInput.value);
    const hasInvalidValue = (minValue !== null && (!Number.isFinite(minValue) || minValue < 0))
        || (maxValue !== null && (!Number.isFinite(maxValue) || maxValue < 0));

    if (hasInvalidValue || (minValue !== null && maxValue !== null && minValue > maxValue)) {
        priceError.hidden = false;
        return;
    }

    appliedPriceRange = minValue === null && maxValue === null ? null : {
        min: minValue,
        max: maxValue
    };
    setPriceRangeLabel(appliedPriceRange);
    updateInventory();
    closePricePanel();
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.price-filter')) {
        closePricePanel();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !priceFilterPanel.hidden) {
        closePricePanel();
        priceFilterToggle.focus();
    }
});

[searchInput, yearFilter, typeFilter, brandFilter, sortControl]
    .forEach((control) => control.addEventListener('input', updateInventory));

// ── Vehicle Details Modal ──

const vehicleModal = document.getElementById('vehicle_modal');
const modalImg = document.getElementById('modal_img');
const modalHeading = document.getElementById('modal_heading');
const modalYear = document.getElementById('modal_year');
const modalMake = document.getElementById('modal_make');
const modalModel = document.getElementById('modal_model');
const modalPrice = document.getElementById('modal_price');
const modalEngine = document.getElementById('modal_engine');
const modalType = document.getElementById('modal_type');
const modalColor = document.getElementById('modal_color');
const modalStatus = document.getElementById('modal_status');
const modalCloseBtn = document.getElementById('modal_close');

function openModal(card) {
    modalImg.src = card.querySelector('.vehicle-photo img').src;
    modalImg.alt = card.querySelector('.vehicle-photo img').alt;
    modalHeading.textContent = `${card.dataset.make} ${card.dataset.model}`;
    modalYear.textContent = card.dataset.year;
    modalMake.textContent = card.dataset.make;
    modalModel.textContent = card.dataset.model;
    modalPrice.textContent = `$${Number(card.dataset.price).toLocaleString('en-US')}`;
    modalEngine.textContent = card.dataset.engine;
    modalType.textContent = card.dataset.vehicleType;
    modalColor.textContent = card.dataset.color;

    modalStatus.textContent = 'In inventory';
    modalStatus.classList.remove('is-sold');

    vehicleModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modalCloseBtn.focus();
}

function closeModal() {
    vehicleModal.classList.remove('active');
    document.body.style.overflow = '';
}

vehicleGrid.addEventListener('click', (event) => {
    const detailsButton = event.target.closest('.details-button');
    if (!detailsButton) {
        return;
    }

    event.preventDefault();
    openModal(detailsButton.closest('.vehicle-card'));
});

modalCloseBtn.addEventListener('click', closeModal);

vehicleModal.addEventListener('click', function (e) {
    if (e.target === vehicleModal) {
        closeModal();
    }
});

document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && vehicleModal.classList.contains('active')) {
            closeModal();
        }
    });

loadVehicles();
window.setInterval(loadVehicles, 30000);