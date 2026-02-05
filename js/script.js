const itemInput = document.getElementById('text_input');
const dateInput = document.getElementById('date_input');
const statusInput = document.getElementById('status_input');
const actionsInput = document.getElementById('actions_input');
const addButton = document.getElementById('add_task_button');
const itemTableBody = document.getElementById('item_body');
const filterSelect = document.getElementById('filter_select');
const deleteAllButton = document.getElementById('delete_all_button');

document.addEventListener('DOMContentLoaded', () => {
    showEmptyMessage('No task found');
})

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification';

    const bgColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#F59E0B';

    toast.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
        ">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                ${type === 'success' 
                    ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>'
                    : type === 'error'
                    ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>'
                    : '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>'
                }
            </svg>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    .input-error {
        border-color: #EF4444 !important;
        animation: shake 0.3s ease-in-out;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    .task-row-enter {
        animation: taskEnter 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

function validateForm(){
    let isValid = true;

    itemInput.classList.remove('input-error');
    dateInput.classList.remove('input-error');
    actionsInput.classList.remove('input-error');

    const newItemValue = itemInput.value.trim();
    const newDateValue = dateInput.value.trim();
    const newActionsValue = actionsInput.value.trim();

    if (newItemValue === ''){
        itemInput.classList.add('input-error');
        showToast('Please enter a task name', 'error');
        itemInput.focus();
        isValid = false;
        return isValid;
    }
    if (newItemValue.length < 3){
        itemInput.classList.add('input-error');
        showToast('Task name must be at least 3 characters', 'error');
        itemInput.focus();
        isValid = false;
        return isValid;
    }
    if (newDateValue === ''){
        dateInput.classList.add('input-error');
        showToast('Please select a due date', 'error');
        dateInput.focus();
        isValid = false;
        return isValid;
    }

    const selectedDate = new Date(newDateValue);
    if (isNaN(selectedDate.getTime())) {
        dateInput.classList.add('input-error');
        showToast('Please enter a valid date', 'error');
        dateInput.focus();
        isValid = false;
        return isValid;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today){
        dateInput.classList.add('input-error');
        showToast('Due date cannot be in the past', 'error');
        dateInput.focus();
        isValid = false;
        return isValid;
    }

    if (newActionsValue !== '' && newActionsValue.length < 5){
        actionsInput.classList.add('input-error');
        showToast('Actions must be at least 5 characters if provided', 'warning');
        actionsInput.focus();
        isValid = false;
        return isValid;
    }

    return isValid;
}

function formatDateForDisplay(dateString) {
    if (!dateString) return '';

    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
}

// ADD TO DO BUTTON N IT'S FUNCTION
addButton.addEventListener('click', addItemToTable);

// Also allow Enter key to submit (except in textarea)
itemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addItemToTable();
    }
});
dateInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addItemToTable();
    }
});
statusInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addItemToTable();
    }
});

function addItemToTable() {
    
    if (!validateForm()){
        return;
    }
    
    clearMessage();

    const newItemValue = itemInput.value.trim();
    const newDateValue = dateInput.value.trim();
    const newStatusValue = statusInput.value;
    const newActionsValue = actionsInput.value.trim();

    // if (newItemValue === '') return;

    const newRow = document.createElement('tr');
    newRow.classList.add('task-row-enter');

    const formattedDate = formatDateForDisplay(newDateValue);

    const dataItems = [newItemValue, formattedDate, newStatusValue, newActionsValue];

    dataItems.forEach(item => {
        const newCell = document.createElement('td');
        newCell.classList.add('py-2', 'px-4', 'text-center');
        newCell.textContent = item;
        newRow.appendChild(newCell);
    })

    itemTableBody.appendChild(newRow);

    // Show success toast
    showToast('Task added successfully!', 'success');

    // Reset input
    itemInput.value = '';
    dateInput.value = '';
    statusInput.value = 'Not started yet';
    actionsInput.value = '';

    itemInput.focus();

    filterTable();
}

// MAKE DEFAULT LABEL FOR FILTER BUTTON SELECTION
function addDefaultLabel(selectElementId, labelText) {
    const selectElement = document.getElementById(selectElementId);

    if (!selectElement) {
        console.error('Select element not found!');
        return;
    }

    const defaultOption = document.createElement('option');

    defaultOption.textContent = labelText;
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;

    selectElement.insertBefore(defaultOption, selectElement.firstChild);
}

addDefaultLabel('filter_select', 'FILTER');

const filter_select = document.getElementById('filter_select');

// FILTER FUNCTION - DIPERBAIKI
filterSelect.addEventListener('change', filterTable)

function filterTable() {
    const selectedStatus = filterSelect.value;
    const rows = itemTableBody.querySelectorAll('tr');
    
    // Filter hanya baris yang memiliki 4 kolom (baris data asli)
    const realRows = [...rows].filter(row => row.children.length === 4);
    
    // Jika tidak ada data sama sekali
    if (realRows.length === 0) {
        showEmptyMessage('No task found');
        return;
    }

    clearMessage();
    
    let visibleCount = 0;

    realRows.forEach(row => {
        const statusCell = row.children[2]; // Kolom status ada di index 2
        const statusText = statusCell.textContent.trim();

        // Tampilkan semua jika filter kosong, atau tampilkan sesuai status
        if (selectedStatus === '' || selectedStatus === 'All' || statusText === selectedStatus) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    // Jika ada data tapi tidak ada yang cocok dengan filter
    if (visibleCount === 0) {
        showEmptyMessage('No task with this status');
    }
}

// DELETE ALL FUNCTION
deleteAllButton.addEventListener('click', deleteAll);

function deleteAll() {
    const realRows = [...itemTableBody.querySelectorAll('tr')].filter(row => row.children.length === 4);
    
    if (realRows.length === 0) {
        showToast('No tasks to delete', 'warning');
        return;
    }

    if (!confirm('Are you sure you want to delete all tasks?')) return;
    
    itemTableBody.innerHTML = '';
    filterSelect.value = '';

    showEmptyMessage('No task found');
    showToast('All tasks deleted', 'success');
}

// EMPTY TABLE FUNCTION
function showEmptyMessage(message) {
    const existingMessage = document.getElementById('empty-message');
    if (existingMessage) {
        existingMessage.querySelector('td').textContent = message;
        return;
    }

    const row = document.createElement('tr');
    row.id = 'empty-message';

    const cell = document.createElement('td');

    cell.colSpan = 4;
    cell.classList.add('py-6', 'text-center', 'text-gray-500');
    cell.textContent = message;

    row.appendChild(cell);
    itemTableBody.appendChild(row);
}

document.addEventListener('DOMContentLoaded', () => {
    showEmptyMessage('No task found');
})

function clearMessage() {
    const msg = document.getElementById('empty-message');
    if (msg) msg.remove();
}