let expenses = [];
let total = 0;

function addExpense() {
    const amount = prompt("Montant de la dépense :");
    
    if (amount && !isNaN(amount)) {
        const val = parseFloat(amount);
        expenses.push(val);
        updateUI(val);
    }
}

function updateUI(newVal) {
    const list = document.getElementById('expense-list');
    const totalEl = document.getElementById('total-amount');

    // Ajouter à la liste
    const item = document.createElement('div');
    item.className = 'expense-item';
    item.innerHTML = `<span>Dépense</span> <b>${newVal.toFixed(2)} €</b>`;
    list.prepend(item);

    // Mettre à jour le total
    total += newVal;
    totalEl.innerText = `${total.toFixed(2)} €`;
}
