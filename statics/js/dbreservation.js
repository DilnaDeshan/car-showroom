const API_URL = 'API/dbreservations.php';
const FALLBACK_IMG = 'statics/image/backgroundimage-car.jpg';

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
    alertBannerEl.classList.remove('hidden');
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
        tableWrapperEl.classList.add('hidden');
        emptyStateEl.classList.remove('hidden');
        reservationsBodyEl.innerHTML = '';
        return;
    }

    emptyStateEl.classList.add('hidden');
    tableWrapperEl.classList.remove('hidden');

    reservationsBodyEl.innerHTML = reservations.map((res) => {
        const imgSrc = res.image && res.image.trim() !== '' ? res.image : FALLBACK_IMG;
        const vehicleName = `${res.make} ${res.model}`;
        const customerName = `${res.first_name} ${res.last_name}`;
        const schedule = `${formatDate(res.Preffered_date)} · ${formatTime(res.preffered_time)}`;
        const messageHtml = res.add_Message && res.add_Message.trim() !== ''
            ? escapeHtml(res.add_Message).replace(/\n/g, '<br>')
            : '<span class="msg-empty">No message provided</span>';

        return `
            <tr data-id="${Number(res.reservation_id)}">
                <td>#${Number(res.reservation_id)}</td>
                <td>
                    <div class="veh-cell">
                        <img class="veh-thumb"
                             src="${escapeHtml(imgSrc)}"
                             alt="${escapeHtml(vehicleName)}"
                             onerror="this.src='${FALLBACK_IMG}'">
                        <div>
                            <div class="veh-name">${escapeHtml(vehicleName)}</div>
                            <div class="veh-year">${Number(res.year)}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="cust-name">${escapeHtml(customerName)}</div>
                </td>
                <td>
                    <div>${escapeHtml(res.email)}</div>
                    <div class="cust-contact">${escapeHtml(res.phone)}</div>
                </td>
                <td>
                    <span class="schedule-pill">${escapeHtml(schedule)}</span>
                </td>
                <td>
                    <div class="msg-box">${messageHtml}</div>
                </td>
                <td>
                    <button type="button" class="btn-delete" data-delete-id="${Number(res.reservation_id)}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function fetchReservations() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok || !data.success) {
            if (data.redirect) {
                window.location.href = data.redirect;
                return;
            }
            throw new Error(data.error || 'Failed to load reservations.');
        }

        renderReservations(data.reservations);
    } catch (err) {
        showAlert(`Error: ${err.message}`);
    }
}

async function deleteReservation(reservationId) {
    if (!confirm('Remove this reservation?')) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', delete_id: reservationId })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to delete reservation.');
        }

        showAlert('Reservation removed successfully.');
        await fetchReservations();
    } catch (err) {
        showAlert(`Delete error: ${err.message}`);
    }
}

// Event delegation for Delete buttons
reservationsBodyEl.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.btn-delete');
    if (!deleteBtn) return;

    const id = Number(deleteBtn.dataset.deleteId);
    if (id) {
        deleteReservation(id);
    }
});

// Load bookings on page startup
document.addEventListener('DOMContentLoaded', fetchReservations);