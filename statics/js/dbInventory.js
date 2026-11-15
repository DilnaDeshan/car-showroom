// Mobile Sidebar Toggle
const sidebar = document.getElementById('sidebar');
document.getElementById('openSidebar').addEventListener('click', () => sidebar.classList.add('open'));
document.getElementById('closeSidebar').addEventListener('click', () => sidebar.classList.remove('open'));
document.getElementById('sidebarAddVehicle').addEventListener('click', () => {
    sidebar.classList.remove('open');
    resetForm();
});

// Status Switch Label Update
const statusToggle = document.getElementById('statusToggle');
const statusLabelText = document.getElementById('statusLabelText');
statusToggle.addEventListener('change', () => {
    statusLabelText.textContent = statusToggle.checked ? 'In Stock' : 'Sold';
});

// File Input & Drag-and-Drop Feedback
const imageInput = document.getElementById('imageInput');
const dropZone = document.getElementById('dropZone');
const dropText = document.getElementById('dropText');

imageInput.addEventListener('change', () => {
    if (imageInput.files.length > 0) {
        dropText.textContent = imageInput.files[0].name;
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        imageInput.files = e.dataTransfer.files;
        dropText.textContent = e.dataTransfer.files[0].name;
    }
});

// Populate Form for Editing
function editVehicle(data) {
    document.getElementById('formTitle').textContent = 'Edit Vehicle';
    document.getElementById('submitBtn').textContent = 'Update Vehicle';
    document.getElementById('veh_id').value = data.veh_id;
    document.getElementById('make_model').value = data.make_model;
    document.getElementById('year').value = data.year;
    document.getElementById('price').value = data.price;
    document.getElementById('engine').value = data.engine;
    document.getElementById('existing_image').value = data.image;
    dropText.textContent = 'Current: ' + data.image.split('/').pop();

    const isStock = data.status === 'In Stock';
    statusToggle.checked = isStock;
    statusLabelText.textContent = isStock ? 'In Stock' : 'Sold';

    document.getElementById('vehicleFormCard').scrollIntoView({ behavior: 'smooth' });
}

// Reset Form to Add Mode
function resetForm() {
    document.getElementById('vehicleForm').reset();
    document.getElementById('formTitle').textContent = 'Add New Vehicle';
    document.getElementById('submitBtn').textContent = 'Save Vehicle';
    document.getElementById('veh_id').value = '';
    document.getElementById('existing_image').value = '';
    dropText.textContent = 'Drag-and-drop zone';
    statusToggle.checked = true;
    statusLabelText.textContent = 'In Stock';
}

function showInventoryMessage(message, isError) {
    const messageElement = document.getElementById('dashboardMessage');
    messageElement.textContent = message;
    messageElement.style.color = isError ? '#f1a4a4' : 'var(--text-muted)';
    messageElement.style.margin = '24px';
    messageElement.hidden = message === '';
}

function createTextCell(value, className) {
    const cell = document.createElement('td');
    cell.textContent = value;
    if (className) {
        cell.className = className;
    }
    return cell;
}

function createVehicleRow(vehicle) {
    const row = document.createElement('tr');
    const imageCell = document.createElement('td');
    const image = document.createElement('img');
    image.src = vehicle.image;
    image.alt = 'Vehicle';
    image.className = 'car-thumb';
    imageCell.appendChild(image);
    row.appendChild(imageCell);

    const fullModel = [vehicle.make, vehicle.model].filter(Boolean).join(' ').trim();
    row.appendChild(createTextCell(fullModel, 'model-cell'));
    row.appendChild(createTextCell(String(vehicle.year)));
    row.appendChild(createTextCell('$' + Number(vehicle.price).toLocaleString()));

    const isStock = vehicle.status === 'In Stock';
    const statusCell = document.createElement('td');
    const statusLink = document.createElement('a');
    statusLink.href = 'api/actions.php?toggle_status=1&id=' + encodeURIComponent(vehicle.veh_id);
    statusLink.className = 'status-pill ' + (isStock ? 'status-stock' : 'status-sold');
    statusLink.title = 'Click to toggle status';

    const statusText = document.createElement('span');
    statusText.textContent = vehicle.status;
    const dot = document.createElement('span');
    dot.className = 'dot';
    if (isStock) {
        statusLink.append(statusText, dot);
    } else {
        statusLink.append(dot, statusText);
    }
    statusCell.appendChild(statusLink);
    row.appendChild(statusCell);

    const actionsCell = document.createElement('td');
    const actionGroup = document.createElement('div');
    actionGroup.className = 'action-group';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'action-btn edit-btn';
    editButton.title = 'Edit';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editVehicle({
        veh_id: vehicle.veh_id,
        make_model: fullModel,
        year: vehicle.year,
        price: vehicle.price,
        engine: vehicle.engine,
        image: vehicle.image,
        status: vehicle.status
    }));

    const deleteLink = document.createElement('a');
    deleteLink.href = 'api/actions.php?delete_id=' + encodeURIComponent(vehicle.veh_id);
    deleteLink.className = 'action-btn delete-btn';
    deleteLink.textContent = 'Delete';
    deleteLink.addEventListener('click', (event) => {
        if (!confirm('Delete this vehicle from inventory?')) {
            event.preventDefault();
        }
    });

    actionGroup.append(editButton, deleteLink);
    actionsCell.appendChild(actionGroup);
    row.appendChild(actionsCell);
    return row;
}

async function loadInventory() {
    const errorMessages = {
        invalid_vehicle: 'Check the vehicle details and try again.',
        upload_invalid: 'Upload a JPEG, PNG, or WebP image smaller than 5 MB.',
        upload_failed: 'The image could not be saved. Check the uploads folder permissions and try again.'
    };
    const query = new URLSearchParams(window.location.search);
    const errorMessage = errorMessages[query.get('error')];
    if (errorMessage) {
        showInventoryMessage(errorMessage, true);
    }

    try {
        const response = await fetch('api/dashboard.php', {
            credentials: 'same-origin',
            headers: { Accept: 'application/json' }
        });
        if (response.status === 401) {
            window.location.replace('login.html?error=owner_only');
            return;
        }
        if (!response.ok) {
            throw new Error('Unable to load the vehicle inventory.');
        }

        const data = await response.json();
        const rows = document.getElementById('vehicleRows');
        if (data.vehicles.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = createTextCell('No vehicles found in inventory.');
            emptyCell.colSpan = 6;
            emptyCell.style.textAlign = 'center';
            emptyCell.style.padding = '30px';
            emptyRow.appendChild(emptyCell);
            rows.appendChild(emptyRow);
        } else {
            data.vehicles.forEach((vehicle) => rows.appendChild(createVehicleRow(vehicle)));
        }

        document.getElementById('dashboardWrapper').hidden = false;
    } catch (error) {
        console.error(error);
        showInventoryMessage('Unable to load the inventory. Please try again later.', true);
    }
}

loadInventory();