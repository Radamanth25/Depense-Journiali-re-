// On récupère les données sauvegardées ou on crée un tableau vide
let expenses = JSON.parse(localStorage.getItem('myExpenses')) || [];

// Fonction pour calculer le total
const calculateTotal = () => expenses.reduce((acc, curr) => acc + curr.amount, 0);

function addExpense() {
    const label = prompt("Objet de la dépense (ex: Café, Courses) :");
    const amount = prompt("Montant (€) :");
    
    if (label && amount && !isNaN(amount)) {
        const newExpense = {
            id: Date.now(),
            label: label,
            amount: parseFloat(amount),
            date: new Date().toLocaleDateString('fr-FR')
        };
        
        expenses.push(newExpense);
        saveAndRender();
    }
}

function saveAndRender() {
    // 1. Sauvegarde dans la mémoire du téléphone
    localStorage.setItem('myExpenses', JSON.stringify(expenses));
    
    // 2. Mise à jour de l'affichage
    const list = document.getElementById('expense-list');
    const totalEl = document.getElementById('total-amount');
    
    list.innerHTML = ''; // On vide pour reconstruire
    
    expenses.slice().reverse().forEach(exp => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.style = "display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;";
        item.innerHTML = `
            <span>${exp.label} <small>(${exp.date})</small></span>
            <b>${exp.amount.toFixed(2)} €</b>
        `;
        list.appendChild(item);
    });

    totalEl.innerText = `${calculateTotal().toFixed(2)} €`;
}

// Charger les données au démarrage
saveAndRender();
