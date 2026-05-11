/**
 * 💰 Budget Pixel - Application de suivi des dépenses
 * Version 3.1.0 - Jeu de données de test inclus
 */

// ============================================
// ⚙️ CONFIGURATION & ETAT
// ============================================

const APP_CONFIG = {
    version: '3.1.0',
    lastUpdated: new Date().toISOString(),
    name: 'Budget Pixel',
    storageKey: 'budgetPixelExpenses',
    budgetKey: 'budgetPixelBudget'
};

// Données de test pour le développement
const MOCK_DATA = [
    { id: 1, description: "Courses Hebdo", amount: 85.50, category: "Alimentation", timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 2, description: "Loyer", amount: 650.00, category: "Logement", timestamp: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 3, description: "Netflix", amount: 13.99, category: "Loisirs", timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 4, description: "Essence", amount: 60.00, category: "Transport", timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 5, description: "Restaurant Italien", amount: 45.00, category: "Alimentation", timestamp: new Date(Date.now() - 86400000 * 0).toISOString() },
    { id: 6, description: "Pharmacie", amount: 12.30, category: "Santé", timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: 7, description: "Facture Électricité", amount: 92.00, category: "Factures", timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 8, description: "Boulangerie", amount: 4.50, category: "Alimentation", timestamp: new Date(Date.now() - 86400000 * 0).toISOString() },
    { id: 9, description: "Ciné avec amis", amount: 24.00, category: "Loisirs", timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 10, description: "Achat Amazon (Livre)", amount: 15.00, category: "Loisirs", timestamp: new Date(Date.now() - 86400000 * 6).toISOString() }
];

let AppState = {
    expenses: JSON.parse(localStorage.getItem(APP_CONFIG.storageKey)) || [],
    budget: parseFloat(localStorage.getItem(APP_CONFIG.budgetKey)) || 1000,
    activeTab: 'expenses'
};

// Injection automatique si vide
if (AppState.expenses.length === 0) {
    AppState.expenses = MOCK_DATA;
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(MOCK_DATA));
}

// ============================================
// 📱 ELEMENTS DU DOM
// ============================================

const elements = {
    tabs: document.querySelectorAll('.tab-content'),
    navBtns: document.querySelectorAll('.nav-btn'),
    form: {
        desc: document.getElementById('desc'),
        amount: document.getElementById('amount'),
        category: document.getElementById('category'),
        addBtn: document.getElementById('add-btn')
    },
    budgetInput: document.getElementById('budget-input'),
    totalAmount: document.getElementById('total-amount'),
    budgetStatus: document.getElementById('budget-status'),
    budgetProgress: document.getElementById('budget-progress'),
    searchInput: document.getElementById('search-input'),
    filterCategory: document.getElementById('filter-category'),
    filterPeriod: document.getElementById('filter-period'),
    resetFiltersBtn: document.getElementById('reset-filters'),
    expenseList: document.getElementById('expense-list'),
    categoryChart: document.getElementById('categoryChart'),
    dailyChart: document.getElementById('dailyChart'),
    appVersion: document.getElementById('app-version'),
    toast: document.getElementById('toast')
};

let charts = { category: null, daily: null };

// ============================================
// 🛠️ UTILITAIRES
// ============================================

function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast show ${type}`;
    setTimeout(() => elements.toast.className = 'toast', 3000);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

// ============================================
// 💾 GESTION DES DONNÉES
// ============================================

function saveExpenses() {
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(AppState.expenses));
}

function addExpense() {
    const desc = elements.form.desc.value.trim();
    const amount = parseFloat(elements.form.amount.value);
    const category = elements.form.category.value;

    if (!desc || isNaN(amount) || amount <= 0 || !category) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }

    const newExpense = {
        id: Date.now(),
        description: desc,
        amount: amount,
        category: category,
        timestamp: new Date().toISOString()
    };

    AppState.expenses.unshift(newExpense);
    saveExpenses();
    renderAll();
    
    elements.form.desc.value = '';
    elements.form.amount.value = '';
    showToast('Dépense ajoutée !');
}

function deleteExpense(id) {
    AppState.expenses = AppState.expenses.filter(exp => exp.id !== id);
    saveExpenses();
    renderAll();
    showToast('Dépense supprimée', 'warning');
}

// ============================================
// 📊 RENDU DES GRAPHIQUES
// ============================================

function updateCharts() {
    if (AppState.expenses.length === 0 || !window.Chart) return;

    // Chart 1: Répartition par Catégorie
    const catDataMap = {};
    AppState.expenses.forEach(exp => {
        catDataMap[exp.category] = (catDataMap[exp.category] || 0) + exp.amount;
    });

    if (charts.category) charts.category.destroy();
    charts.category = new Chart(elements.categoryChart, {
        type: 'doughnut',
        data: {
            labels: Object.keys(catDataMap),
            datasets: [{
                data: Object.values(catDataMap),
                backgroundColor: ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#a142f4', '#ff6d00'],
                borderColor: getComputedStyle(document.body).getPropertyValue('--bg')
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Chart 2: 7 derniers jours
    const dailyData = [];
    const dailyLabels = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        dailyLabels.push(d.toLocaleDateString('fr-FR', { weekday: 'short' }));
        
        const total = AppState.expenses
            .filter(exp => exp.timestamp.startsWith(dateKey))
            .reduce((s, e) => s + e.amount, 0);
        dailyData.push(total);
    }

    if (charts.daily) charts.daily.destroy();
    charts.daily = new Chart(elements.dailyChart, {
        type: 'bar',
        data: {
            labels: dailyLabels,
            datasets: [{ label: 'Dépenses (€)', data: dailyData, backgroundColor: '#1a73e8', borderRadius: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ============================================
// 🎯 RENDU UI
// ============================================

function renderExpensesList() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const catFilter = elements.filterCategory.value;

    let filtered = AppState.expenses.filter(exp => {
        const matchesSearch = exp.description.toLowerCase().includes(searchTerm);
        const matchesCat = !catFilter || exp.category === catFilter;
        return matchesSearch && matchesCat;
    });

    elements.expenseList.innerHTML = filtered.map(exp => `
        <div class="expense-item">
            <div class="item-left">
                <div class="item-category">${escapeHTML(exp.category)}</div>
                <div class="item-details">
                    <strong>${escapeHTML(exp.description)}</strong>
                    <span class="item-date">${formatDate(exp.timestamp)}</span>
                </div>
            </div>
            <div class="item-right">
                <div class="item-amount">${exp.amount.toFixed(2)} €</div>
                <button class="delete-btn" onclick="deleteExpense(${exp.id})">×</button>
            </div>
        </div>
    `).join('');
}

function renderBudget() {
    const total = AppState.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    elements.totalAmount.textContent = `${total.toFixed(2)} €`;
    
    if (AppState.budget > 0) {
        const percent = Math.min((total / AppState.budget) * 100, 100);
        elements.budgetProgress.style.width = `${percent}%`;
        elements.budgetStatus.textContent = total > AppState.budget ? "Budget dépassé !" : `Reste: ${(AppState.budget - total).toFixed(2)} €`;
        elements.budgetStatus.className = `budget-status ${total > AppState.budget ? 'danger' : 'success'}`;
    }
}

function renderAll() {
    renderExpensesList();
    renderBudget();
    if (AppState.activeTab === 'stats') updateCharts();
}

// ============================================
// 🚀 INITIALISATION
// ============================================

function init() {
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            AppState.activeTab = tabId;
            elements.navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            elements.tabs.forEach(tab => tab.classList.toggle('active', tab.id === `${tabId}-tab`));
            if (tabId === 'stats') updateCharts();
        });
    });

    elements.form.addBtn.addEventListener('click', addExpense);
    elements.budgetInput.value = AppState.budget;
    elements.budgetInput.addEventListener('input', (e) => {
        AppState.budget = parseFloat(e.target.value) || 0;
        localStorage.setItem(APP_CONFIG.budgetKey, AppState.budget);
        renderBudget();
    });

    elements.appVersion.textContent = `v${APP_CONFIG.version}`;
    renderAll();
}

document.addEventListener('DOMContentLoaded', init);