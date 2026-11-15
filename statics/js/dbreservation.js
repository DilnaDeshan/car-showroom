const API_URL = 'API/dbreservation.php';
const FALLBACK_IMG = 'statics/image/backgroundimage-car.jpg';

const dashboardWrapper = document.getElementById('dashboardWrapper');
const dashboardMessage = document.getElementById('dashboardMessage');
const bookingCountEl = document.getElementById('bookingCount');
const alertBannerEl = document.getElementById('alertBanner');
const emptyStateEl = document.getElementById('emptyState');
const tableWrapperEl = document.getElementById('tableWrapper');
const reservationsBodyEl = document.getElementById('reservationsBody');

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
}

function showAlert(message) {
    alertBannerEl.textContent = message;
    alertBannerEl.hidden = false;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });
}

function formatTime(timeStr) {
    if (!timeStr) return 'N/A';
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${minuteStr} ${ampm}`;
}

function renderReservations(reservations) {
    const count = reservations.length;
    bookingCountEl.textContent = `${count} ${count === 1 ? 'Booking' : 'Bookings'}`;

    if (count === 0) {
        tableWrapperEl.hidden = true;
        emptyStateEl.hidden = false;
        reservationsBodyEl.replaceChildren();
        return;
    }

    emptyStateEl.hidden = true;
    tableWrapperEl.hidden = false;
    reservationsBodyEl.innerHTML = reservations.map((res) => {
        const imgSrc = res.image && res.image.trim() !== '' ? res.image : FALLBACK_IMG;
        const vehicleName = `${res.make} ${res.model}`.trim();
        const customerName = `${res.first_name} ${res.last_name}`.trim();
        const schedule = `${formatDate(res.Preffered_date)} · ${formatTime(res.preffered_time)}`;
        const messageHtml = res.add_Message && res.add_Message.trim() !== ''
            ? escapeHtml(res.add_Message).replace(/\n/g, '<br>')
            : '<span class="msg-empty">No message provided</span>';

        return `
            <tr>
                <td>#${Number(res.reservation_id)}</td>
                <td>
                    <div class="veh-cell">
                        <img class="veh-thumb"
                             src="${escapeHtml(imgSrc)}"
                             alt="${escapeHtml(vehicleName)}"
                             onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
                        <div>
                            <div class="veh-name">${escapeHtml(vehicleName)}</div>
                            <div class="veh-year">${Number(res.year)}</div>
                        </div>
                    </div>
                </td>
                <td><div class="cust-name">${escapeHtml(customerName)}</div></td>
                <td>
                    <div>${escapeHtml(res.email)}</div>
                    <div class="cust-contact">${escapeHtml(res.phone)}</div>
                </td>
                <td><span class="schedule-pill">${escapeHtml(schedule)}</span></td>
                <td><div class="msg-box">${messageHtml}</div></td>
                <td>
                    <button type="button" class="btn-delete" data-delete-id="${Number(res.reservation_id)}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function readResponse(response) {
    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error('The server returned an invalid response.');
    }

    if (!response.ok) {
        if (response.status === 401) {
            window.location.replace('login.html?error=owner_only');
            return null;
        }
        throw new Error(data.error || 'The reservation request could not be completed.');
    }

    return data;
}

async function fetchReservations() {
    try {
        const response = await fetch(API_URL, {
            credentials: 'same-origin',
            headers: { Accept: 'application/json' }
        });
        const data = await readResponse(response);
        if (!data) return;
        if (!Array.isArray(data.reservations)) {
            throw new Error('The server returned an invalid reservations list.');
        }

        renderReservations(data.reservations);
        dashboardWrapper.hidden = false;
    } catch (error) {
        dashboardMessage.textContent = `Unable to load reservations. ${error.message}`;
        dashboardMessage.hidden = false;
    }
}

async function deleteReservation(reservationId, button) {
    if (!confirm('Remove this reservation?')) return;

    button.disabled = true;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({ action: 'delete', delete_id: reservationId })
        });
        const data = await readResponse(response);
        if (!data) return;
        if (!data.success) {
            throw new Error(data.error || 'Failed to remove this reservation.');
        }

        showAlert('Reservation removed successfully.');
        await fetchReservations();
    } catch (error) {
        showAlert(`Delete error: ${error.message}`);
    } finally {
        button.disabled = false;
    }
}

reservationsBodyEl.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.btn-delete');
    if (!deleteBtn) return;

    const id = Number(deleteBtn.dataset.deleteId);
    if (Number.isInteger(id) && id > 0) {
        deleteReservation(id, deleteBtn);
    }
});

document.getElementById('openSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
});
document.getElementById('closeSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
});

fetchReservations();
