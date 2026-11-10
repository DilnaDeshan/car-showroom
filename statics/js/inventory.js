const vehicleGrid = document.getElementById('vehicle_grid');
const vehicleCards = Array.from(vehicleGrid.querySelectorAll('.vehicle-card'));
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

const currentYear = new Date().getFullYear();
for (let year = currentYear; year >= 1900; year -= 1) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
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

vehicleGrid.querySelectorAll('.vehicle-photo img').forEach((image) => {
    image.addEventListener('error', () => {
        image.src = 'statics/image/backgroundimage-car.jpg';
    }, { once: true });
});


// ── Vehicle Details Modal ──

const vehicleModal = document.getElementById('vehicle_modal');
const modalImg = document.getElementById('modal_img');
const modalHeading = document.getElementById('modal_heading');
const modalYear = document.getElementById('modal_year');
const modalMake = document.getElementById('modal_make');
const modalModel = document.getElementById('modal_model');
const modalPrice = document.getElementById('modal_price');
const modalEngine = document.getElementById('modal_engine');
const modalDrive = document.getElementById('modal_drive');
const modalStatus = document.getElementById('modal_status');
const modalCloseBtn = document.getElementById('modal_close');

function openModal(button) {
    modalImg.src = button.dataset.img;
    modalImg.alt = button.dataset.alt;
    modalHeading.textContent = button.dataset.title;
    modalYear.textContent = button.dataset.year;
    modalMake.textContent = button.dataset.make;
    modalModel.textContent = button.dataset.model;
    modalPrice.textContent = button.dataset.price;
    modalEngine.textContent = button.dataset.engine;
    modalDrive.textContent = button.dataset.drive;

    modalStatus.textContent = button.dataset.status;
    modalStatus.classList.toggle('is-sold', button.dataset.status === 'Sold');

    vehicleModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modalCloseBtn.focus();
}

function closeModal() {
    vehicleModal.classList.remove('active');
    document.body.style.overflow = '';
}

document.querySelectorAll('.details-button').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal(btn);
    });
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