/**
 * 💰 Budget Pixel - Application de suivi des dépenses
 * Version 3.2.0 - Ajout du camembert des dépenses individuelles
 */

// ============================================
// ⚙️ CONFIGURATION & ETAT
// ============================================

const APP_CONFIG = {
    version: '3.2.0',
    lastUpdated: new Date().toISOString(),
    name: 'Budget Pixel',
    storageKey: 'budgetPixelExpenses',
    budgetKey: 'budgetPixelBudget'
};

// Données de test pour le développement (si vide)
const MOCK_DATA = [
    { id: 1, description: "Courses Hebdo", amount: 85.50, category: "Alimentation", timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 2, description: "Loyer", amount: 650.00, category: "Logement", timestamp: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 3, description: "Netflix", amount: 13.99, category: "Loisirs", timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 4, description: "Essence", amount: 60.00, category: "Transport", timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 5, description: "Restaurant Italien", amount: 45.00, category: "Alimentation", timestamp: new Date(Date.now() - 86400000 * 0).toISOString() }
];

let AppState = {
    expenses: JSON.parse(localStorage.getItem(APP_CONFIG.storageKey)) || [],
    budget: parseFloat(localStorage.getItem(APP_CONFIG.budgetKey)) || 1000,
    activeTab: 'expenses'
};

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
    expenseList: document.getElementById('expense-list'),
    // Graphiques
    categoryChart: document.getElementById('categoryChart'),
    dailyChart: document.getElementById('dailyChart'),
    pieChart: document.getElementById('pieChart'), // Nouveau
    appVersion: document.getElementById('app-version'),
    toast: document.getElementById('toast')
};

let charts = { category: null, daily: null, pie: null };

// ============================================
// 🛠️ UTILITAIRES
// ============================================

function showToast(message, type = 'success') {
    elements.toast.textContent = message