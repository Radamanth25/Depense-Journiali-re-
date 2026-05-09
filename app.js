/**
 * 💰 Budget Pixel - Application de suivi des dépenses
 * Version 3.0.0 - Complètement refactorisée
 */

const APP_CONFIG = {
    version: '3.0.0',
    lastUpdated: new Date().toISOString(),
    name: 'Budget Pixel',
    storageKey: 'budgetPixelExpenses',
    budgetKey: 'budgetPixelBudget'
};

// ============================================
// 🎯 APPLICATION STATE
// ============================================

const AppState = {
    expenses: JSON.parse(localStorage.getItem(APP_CONFIG.storageKey)) || [],
    budget: parseFloat(localStorage.getItem(APP_CONFIG.budgetKey)) || 0,
    filters: {
        search: '',
        category: '',
        period: 'all'
    },
    currentTab: 'expenses'
};

// ============================================
// 📱 DOM ELEMENTS
// ============================================

const elements = {
    // Form
    descInput: document.getElementById('desc'),
    amountInput: document.getElementById('amount'),
    categorySelect: document.getElementById('category'),
    addBtn: document.getElementById('add-btn'),
    
    // Display
    totalAmount: document.getElementById('total-amount'),
    expenseList: document.getElementById('expense-list'),
    budgetInput: document.getElementById('budget-input'),
    budgetStatus: document.getElementById('budget-status'),
    budgetProgress: document.getElementById('budget-progress'),
    
    // Filters
    searchInput: document.getElementById('search-input'),
    filterCategory: document.getElementById('filter-category'),
    filterPeriod: document.getElementById('filter-period'),
    resetFilters: document.getElementById('reset-filters'),
    
    // Stats
    statTotal: document.getElementById('stat-total'),
    statCount: document.getElementById('stat-count'),
    statAverage: document.getElementById('stat-average'),
    statMax: document.getElementById('stat-max'),
    categoryStats: document.getElementById('category-stats'),
    dailyStats: document.getElementById('daily-stats'),
    
    // Settings
    exportBtn: document.getElementById('export-btn'),
    importBtn: document.getElementById('import-btn'),
    importFile: document.getElementById('import-file'),
    clearAllBtn: document.getElementById('clear-all-btn'),
    notifyBudget: document.getElementById('notify-budget'),
    appVersion: document.getElementById('app-version'),
    
    // Navigation
    navBtns: document.querySelectorAll('.nav-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Toast
    toast: document.getElementById('toast')
};

// ============================================
// 🎨 UTILITY FUNCTIONS
// ============================================

/**
 * Formate une date en français
 */
function formatDate(date) {
    if (typeof date === 'string') date = new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Formate une date courte
 */
function formatDateShort(date) {
    if (typeof date === 'string') date = new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

/**
 * Affiche une notification toast
 */
function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast show ${type}`;
    setTimeout(() => elements.toast.classList.remove('show'), 3000);
}

/**
 * Échappe les caractères HTML pour éviter XSS
 */
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Récupère le début de la période
 */
function getPeriodStart(period) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(period) {
        case 'today':
            return today;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return weekStart;
        case 'month':
            return new Date(today.getFullYear(), today.getMonth(), 1);
        case 'year':
            return new Date(today.getFullYear(), 0, 1);
        default:
            return new Date(1970, 0, 1);
    }
}

/**
 * Filtre les dépenses
 */
function getFilteredExpenses() {
    return AppState.expenses.filter(exp => {
        // Filtre de recherche
        if (AppState.filters.search) {
            const search = AppState.filters.search.toLowerCase();
            if (!exp.label.toLowerCase().includes(search)) return false;
        }
        
        // Filtre de catégorie
        if (AppState.filters.category && exp.category !== AppState.filters.category) {
            return false;
        }
        
        // Filtre de période
        if (AppState.filters.period !== 'all') {
            const expDate = new Date(exp.timestamp);
            const periodStart = getPeriodStart(AppState.filters.period);
            if (expDate < periodStart) return false;
        }
        
        return true;
    });
}

// ============================================
// 💾 DATA MANAGEMENT
// ============================================

/**
 * Sauvegarde les dépenses dans localStorage
 */
function saveExpenses() {
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(AppState.expenses));
}

/**
 * Sauvegarde le budget
 */
function saveBudget() {
    localStorage.setItem(APP_CONFIG.budgetKey, AppState.budget.toString());
}

/**
 * Ajoute une dépense
 */
function addExpense() {
    const label = elements.descInput.value.trim();
    const amount = parseFloat(elements.amountInput.value);
    const category = elements.categorySelect.value;
    
    // Validation
    if (!label) {
        showToast('⚠️ Veuillez entrer une description', 'error');
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        showToast('⚠️ Veuillez entrer un montant valide', 'error');
        return;
    }
    if (!category) {
        showToast('⚠️ Veuillez sélectionner une catégorie', 'error');
        return;
    }
    
    // Créer la dépense
    const newExpense = {
        id: Date.now(),
        label: label,
        amount: amount,
        category: category,
        date: formatDateShort(new Date()),
        timestamp: new Date().toISOString()
    };
    
    AppState.expenses.push(newExpense);
    saveExpenses();
    
    // Réinitialiser le formulaire
    elements.descInput.value = '';
    elements.amountInput.value = '';
    elements.categorySelect.value = '';
    elements.descInput.focus();
    
    showToast('✅ Dépense ajoutée avec succès!', 'success');
    
    // Vérifier le budget
    checkBudget();
    
    // Mettre à jour l'affichage
    render();
}

/**
 * Supprime une dépense
 */
function deleteExpense(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
        AppState.expenses = AppState.expenses.filter(exp => exp.id !== id);
        saveExpenses();
        showToast('✅ Dépense supprimée', 'success');
        render();
    }
}

/**
 * Vérifie si le budget est dépassé
 */
function checkBudget() {
    const total = AppState.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    if (AppState.budget > 0 && total > AppState.budget) {
        if (elements.notifyBudget.checked) {
            showToast('🚨 Budget dépassé !', 'warning');
        }
    }
}

// ============================================
// 🎯 RENDERING FUNCTIONS
// ============================================

/**
 * Affiche la liste des dépenses
 */
function renderExpensesList() {
    const filtered = getFilteredExpenses();
    
    if (filtered.length === 0) {
        elements.expenseList.innerHTML = '<div class="empty-state">Aucune dépense trouvée</div>';
        return;
    }
    
    elements.expenseList.innerHTML = filtered
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(exp => `
            <div class="expense-item">
                <div class="item-left">
                    <div class="item-category">${escapeHTML(exp.category)}</div>
                    <div class="item-details">
                        <strong>${escapeHTML(exp.label)}</strong>
                        <span class="item-date">${exp.date}</span>
                    </div>
                </div>
                <div class="item-right">
                    <div class="item-amount">${exp.amount.toFixed(2)} €</div>
                    <button class="delete-btn" onclick="deleteExpense(${exp.id})" aria-label="Supprimer">🗑️</button>
                </div>
            </div>
        `).join('');
}

/**
 * Affiche les statistiques
 */
function renderStats() {
    const total = AppState.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const count = AppState.expenses.length;
    const average = count > 0 ? total / count : 0;
    const max = count > 0 ? Math.max(...AppState.expenses.map(e => e.amount)) : 0;
    
    elements.statTotal.textContent = total.toFixed(2) + ' €';
    elements.statCount.textContent = count;
    elements.statAverage.textContent = average.toFixed(2) + ' €';
    elements.statMax.textContent = max.toFixed(2) + ' €';
    
    // Statistiques par catégorie
    const byCategory = {};
    AppState.expenses.forEach(exp => {
        byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    });
    
    const categoryHTML = Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => {
            const percentage = ((amount / total) * 100).toFixed(1);
            return `
                <div class="category-stat">
                    <div class="cat-label">${escapeHTML(cat)}</div>
                    <div class="cat-bar">
                        <div class="cat-progress" style="width: ${percentage}%"></div>
                    </div>
                    <div class="cat-amount">${amount.toFixed(2)} € (${percentage}%)</div>
                </div>
            `;
        }).join('');
    
    elements.categoryStats.innerHTML = categoryHTML || '<div class="empty-state">Aucune donnée</div>';
    
    // Statistiques quotidiennes
    const byDay = {};
    AppState.expenses.forEach(exp => {
        byDay[exp.date] = (byDay[exp.date] || 0) + exp.amount;
    });
    
    const dailyHTML = Object.entries(byDay)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .slice(0, 7)
        .map(([date, amount]) => `
            <div class="daily-stat">
                <div class="day-label">${date}</div>
                <div class="day-amount">${amount.toFixed(2)} €</div>
            </div>
        `).join('');
    
    elements.dailyStats.innerHTML = dailyHTML || '<div class="empty-state">Aucune donnée</div>';
}

/**
 * Affiche le total et la barre de budget
 */
function renderBudget() {
    const total = AppState.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    elements.totalAmount.textContent = total.toFixed(2) + ' €';
    
    if (AppState.budget > 0) {
        const percentage = Math.min((total / AppState.budget) * 100, 100);
        elements.budgetProgress.style.width = percentage + '%';
        
        const remaining = AppState.budget - total;
        if (remaining >= 0) {
            elements.budgetStatus.textContent = `✅ Reste ${remaining.toFixed(2)} €`;
            elements.budgetStatus.className = 'budget-status success';
        } else {
            elements.budgetStatus.textContent = `⚠️ Dépassé de ${Math.abs(remaining).toFixed(2)} €`;
            elements.budgetStatus.className = 'budget-status danger';
        }
    }
}

/**
 * Rendu principal
 */
function render() {
    renderExpensesList();
    renderBudget();
    renderStats();
}

// ============================================
// 📱 EVENT LISTENERS
// ============================================

// Ajout de dépense
elements.addBtn.addEventListener('click', addExpense);
elements.descInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addExpense();
});
elements.amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addExpense();
});

// Budget
elements.budgetInput.addEventListener('change', (e) => {
    AppState.budget = parseFloat(e.target.value) || 0;
    saveBudget();
    renderBudget();
    showToast('✅ Budget mis à jour', 'success');
});

// Filtres
elements.searchInput.addEventListener('input', (e) => {
    AppState.filters.search = e.target.value;
    renderExpensesList();
});

elements.filterCategory.addEventListener('change', (e) => {
    AppState.filters.category = e.target.value;
    renderExpensesList();
});

elements.filterPeriod.addEventListener('change', (e) => {
    AppState.filters.period = e.target.value;
    renderExpensesList();
});

elements.resetFilters.addEventListener('click', () => {
    AppState.filters = { search: '', category: '', period: 'all' };
    elements.searchInput.value = '';
    elements.filterCategory.value = '';
    elements.filterPeriod.value = 'all';
    renderExpensesList();
    showToast('✅ Filtres réinitialisés', 'success');
});

// Navigation des tabs
elements.navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Mettre à jour les boutons
        elements.navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Mettre à jour les tabs
        elements.tabContents.forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        AppState.currentTab = tabName;
        
        // Mettre à jour les stats si nécessaire
        if (tabName === 'stats') {
            renderStats();
        }
    });
});

// Export
elements.exportBtn.addEventListener('click', () => {
    const data = {
        version: APP_CONFIG.version,
        exported: new Date().toISOString(),
        expenses: AppState.expenses,
        budget: AppState.budget
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-export-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('✅ Données exportées', 'success');
});

// Import
elements.importBtn.addEventListener('click', () => {
    elements.importFile.click();
});

elements.importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (confirm('Êtes-vous sûr ? Cela remplacera toutes les dépenses actuelles.')) {
                AppState.expenses = data.expenses || [];
                AppState.budget = data.budget || 0;
                saveExpenses();
                saveBudget();
                elements.budgetInput.value = AppState.budget || '';
                render();
                showToast('✅ Données importées', 'success');
            }
        } catch (err) {
            showToast('❌ Erreur lors de l\'import', 'error');
            console.error(err);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

// Supprimer tout
elements.clearAllBtn.addEventListener('click', () => {
    if (confirm('Êtes-vous VRAIMENT sûr ? Cette action est irréversible !')) {
        if (confirm('Dernière confirmation : Supprimer TOUTES les dépenses ?')) {
            AppState.expenses = [];
            saveExpenses();
            render();
            showToast('✅ Toutes les dépenses supprimées', 'success');
        }
    }
});

// ============================================
// 🚀 INITIALIZATION
// ============================================

function init() {
    // Afficher la version
    elements.appVersion.textContent = `v${APP_CONFIG.version} • ${formatDate(APP_CONFIG.lastUpdated)}`;
    
    // Charger le budget
    if (AppState.budget > 0) {
        elements.budgetInput.value = AppState.budget;
    }
    
    // Rendu initial
    render();
    
    // Enregistrer le service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('✅ Service Worker enregistré'))
            .catch(err => console.warn('⚠️ Service Worker non enregistré:', err));
    }
    
    console.log('🚀 Budget Pixel v3.0.0 initialisé');
}

// Lancer l'app quand le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}