// Initialisation des données
let expenses = JSON.parse(localStorage.getItem('myExpenses')) || [];

// Sélections DOM
const addBtn = document.getElementById('add-btn');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const list = document.getElementById('expense-list');
const totalEl = document.getElementById('total-amount');

function render() {
    list.innerHTML = '';
    let total = 0;

    // On trie pour avoir les plus récents en haut
    expenses.slice().reverse().forEach(exp => {
        total += exp.amount;
        
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.innerHTML = `
            <div class="item-info">
                <strong>${exp.label}</strong>
                <span class="item-date">${exp.date}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <b>${exp.amount.toFixed(2)} €</b>
                <button class="delete-btn" onclick="deleteExpense(${exp.id})">×</button>
            </div>
        `;
        list.appendChild(item);
    });

    totalEl.innerText = `${total.toFixed(2)} €`;
    localStorage.setItem('myExpenses', JSON.stringify(expenses));
}

function addExpense() {
    const label = descInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (label && !isNaN(amount)) {
        const newExpense = {
            id: Date.now(),
            label: label,
            amount: amount,
            date: new Date().toLocaleDateString('fr-FR')
        };

        expenses.push(newExpense);
        descInput.value = '';
        amountInput.value = '';
        render();
    }
}

function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    render();
}

// Écouteur de clic
addBtn.addEventListener('click', addExpense);

// Premier affichage
render();
