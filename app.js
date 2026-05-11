/**
 * 💎 Budget Pixel - Modern Edition
 * Version 5.3.1 - Simulation de données pour 2026
 */

const APP_CONFIG = {
    version: '5.3.1',
    storageKey: 'budgetPixelExpenses',
    budgetKey: 'budgetPixelBudget'
};

const CATEGORY_THEMES = {
    "🏠 LOGEMENT": "#8b5cf6",
    "🍽️ ALIMENTATION": "#10b981",
    "🚗 TRANSPORT": "#0ea5e9",
    "🎮 LOISIRS": "#f43f5e",
    "🏥 SANTÉ": "#f59e0b",
    "AUTRE": "#94a3b8"
};

let AppState = {
    expenses: JSON.parse(localStorage.getItem(APP_CONFIG.storageKey)) || [],
    budget: parseFloat(localStorage.getItem(APP_CONFIG.budgetKey)) || 3000,
    activeTab: 'expenses',
    currentViewDate: new Date()
};

const elements = {
    tabs: document.querySelectorAll('.tab-content'),
    navBtns: document.querySelectorAll('.nav-btn[data-tab]'),
    monthSelector: document.getElementById('month-selector'),
    monthDisplay: document.getElementById('current-month-display'),
    prevMonthBtn: document.getElementById('prev-month'),
    nextMonthBtn: document.getElementById('next-month'),
    expenseList: document.getElementById('expense-list'),
    statBudget: document.getElementById('stat-budget'),
    statSpent: document.getElementById('stat-spent'),
    statRemaining: document.getElementById('stat-remaining'),
    budgetProgress: document.getElementById('budget-progress'),
    budgetInput: document.getElementById('budget-input'),
    toast: document.getElementById('toast'),
    form: {
        desc: document.getElementById('desc'),
        amount: document.getElementById('amount'),
        category: document.getElementById('category'),
        addBtn: document.getElementById('add-btn')
    }
};

function init() {
    if (elements.budgetInput) {
        elements.budgetInput.value = AppState.budget;
        elements.budgetInput.onchange = (e) => {
            AppState.budget = parseFloat(e.target.value) || 0;
            localStorage.setItem(APP_CONFIG.budgetKey, AppState.budget);
            render();
            showToast("Budget mis à jour");
        };
    }
    updateMonthDisplay();
}

elements.navBtns.forEach(btn => {
    btn.onclick = () => {
        const target = btn.getAttribute('data-tab');
        elements.navBtns.forEach(b => b.classList.remove('active'));
        elements.tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${target}-tab`).classList.add('active');
        AppState.activeTab = target;
        elements.monthSelector.style.display = (target === 'yearly') ? 'none' : 'flex';
        render();
    };
});

function updateMonthDisplay() {
    const options = { month: 'long', year: 'numeric' };
    elements.monthDisplay.textContent = AppState.currentViewDate.toLocaleDateString('fr-FR', options);
    render();
}

elements.prevMonthBtn.onclick = () => {
    AppState.currentViewDate.setMonth(AppState.currentViewDate.getMonth() - 1);
    updateMonthDisplay();
};

elements.nextMonthBtn.onclick = () => {
    AppState.currentViewDate.setMonth(AppState.currentViewDate.getMonth() + 1);
    updateMonthDisplay();
};

function render() {
    const viewMonth = AppState.currentViewDate.getMonth();
    const viewYear = AppState.currentViewDate.getFullYear();

    const monthlyExpenses = AppState.expenses.filter(exp => {
        const d = new Date(exp.timestamp);
        return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });

    const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = AppState.budget - totalSpent;
    const percent = Math.min((totalSpent / AppState.budget) * 100, 100);

    if(elements.statBudget) elements.statBudget.textContent = `${AppState.budget}€`;
    if(elements.statSpent) elements.statSpent.textContent = `${totalSpent.toFixed(0)}€`;
    if(elements.statRemaining) {
        elements.statRemaining.textContent = `${remaining.toFixed(0)}€`;
        elements.statRemaining.className = 'stat-value remaining';
        if (percent > 75) elements.statRemaining.classList.add('warning');
        if (percent >= 100) elements.statRemaining.classList.add('danger');
    }
    if(elements.budgetProgress) elements.budgetProgress.style.width = `${percent}%`;

    elements.expenseList.innerHTML = monthlyExpenses.length ? '' : 
        '<div style="color:var(--text-low); text-align:center; padding:2rem; font-size:0.8rem;">Aucune dépense ce mois-ci</div>';
    
    monthlyExpenses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(exp => {
        const catColor = CATEGORY_THEMES[exp.category] || CATEGORY_THEMES.AUTRE;
        const div = document.createElement('div');
        div.className = 'expense-item';
        div.innerHTML = `
            <div class="exp-info">
                <strong style="font-size:0.9rem">${escapeHtml(exp.description)}</strong>
                <small style="color:${catColor}; font-size:0.65rem; font-weight:700;">${exp.category}</small>
            </div>
            <div class="exp-amount">
                <span style="color:${catColor}; font-size:0.95rem">-${exp.amount.toFixed(2)}€</span>
                <button class="btn-del" onclick="deleteExpense(${exp.id})">×</button>
            </div>
        `;
        elements.expenseList.appendChild(div);
    });

    if (AppState.activeTab === 'stats') updateCharts(monthlyExpenses, totalSpent);
    if (AppState.activeTab === 'yearly') renderYearlyView(viewYear);
}

let categoryChart = null, comparisonChart = null, yearlyChart = null;

function updateCharts(data, totalSpent) {
    const ctxCat = document.getElementById('categoryChart');
    const ctxComp = document.getElementById('comparisonChart');
    const diffDisplay = document.getElementById('budget-diff-value');
    if (!ctxCat || !ctxComp) return;

    const remaining = AppState.budget - totalSpent;
    if (diffDisplay) {
        diffDisplay.textContent = `${remaining.toFixed(2)} €`;
        diffDisplay.style.color = remaining >= 0 ? '#10b981' : '#ef4444';
    }

    const catTotals = {};
    data.forEach(exp => catTotals[exp.category] = (catTotals[exp.category] || 0) + exp.amount);
    
    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: Object.keys(catTotals),
            datasets: [{
                data: Object.values(catTotals),
                backgroundColor: Object.keys(catTotals).map(l => CATEGORY_THEMES[l] || CATEGORY_THEMES.AUTRE),
                borderWidth: 0
            }]
        },
        options: { maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } } }
    });

    if (comparisonChart) comparisonChart.destroy();
    comparisonChart = new Chart(ctxComp, {
        type: 'bar',
        data: {
            labels: ['Budget', 'Dépensé'],
            datasets: [{
                data: [AppState.budget, totalSpent],
                backgroundColor: ['#8b5cf6', totalSpent > AppState.budget ? '#ef4444' : '#10b981'],
                borderRadius: 8
            }]
        },
        options: { maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } }, plugins: { legend: { display: false } } }
    });
}

function renderYearlyView(year) {
    const ctxYearly = document.getElementById('yearlyChart');
    const yearTitle = document.getElementById('yearly-display-year');
    if(yearTitle) yearTitle.textContent = year;
    if (!ctxYearly) return;

    const monthsLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const spentPerMonth = new Array(12).fill(0);

    AppState.expenses.forEach(exp => {
        const d = new Date(exp.timestamp);
        if (d.getFullYear() === year) {
            spentPerMonth[d.getMonth()] += exp.amount;
        }
    });

    if (yearlyChart) yearlyChart.destroy();
    yearlyChart = new Chart(ctxYearly, {
        type: 'bar',
        data: {
            labels: monthsLabels,
            datasets: [
                {
                    label: 'Dépenses (€)',
                    data: spentPerMonth,
                    backgroundColor: spentPerMonth.map(v => v > AppState.budget ? '#ef4444' : '#10b981'),
                    borderRadius: 4
                },
                {
                    label: 'Budget Mensuel',
                    data: new Array(12).fill(AppState.budget),
                    type: 'line',
                    borderColor: '#8b5cf6',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
        }
    });
}

/**
 * 🚀 Simulation de données pour l'année 2026
 */
window.injectSampleData = () => {
    const year = 2026;
    const currentMonth = new Date().getMonth();
    const sampleExpenses = [];
    
    // Pour chaque mois écoulé de l'année en cours
    for (let m = 0; m <= currentMonth; m++) {
        // 1. Loyer fixe
        sampleExpenses.push({
            id: Date.now() + Math.random(),
            description: "Loyer & Charges",
            amount: 850,
            category: "🏠 LOGEMENT",
            timestamp: new Date(year, m, 1).toISOString()
        });

        // 2. Courses alimentaires (3 à 4 fois par mois)
        for(let i=0; i<3; i++) {
            sampleExpenses.push({
                id: Date.now() + Math.random(),
                description: "Courses Hebdo",
                amount: Math.floor(Math.random() * 100) + 80,
                category: "🍽️ ALIMENTATION",
                timestamp: new Date(year, m, 5 + (i*7)).toISOString()
            });
        }

        // 3. Quelques loisirs
        sampleExpenses.push({
            id: Date.now() + Math.random(),
            description: "Restaurant / Cinéma",
            amount: Math.floor(Math.random() * 60) + 40,
            category: "🎮 LOISIRS",
            timestamp: new Date(year, m, 15).toISOString()
        });

        // 4. Transport (Essence ou Pass)
        sampleExpenses.push({
            id: Date.now() + Math.random(),
            description: "Transport / Carburant",
            amount: 75,
            category: "🚗 TRANSPORT",
            timestamp: new Date(year, m, 20).toISOString()
        });
    }

    AppState.expenses = [...AppState.expenses, ...sampleExpenses];
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(AppState.expenses));
    
    render();
    showToast(`Données de Janvier à aujourd'hui (${year}) ajoutées !`);
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

elements.form.addBtn.onclick = () => {
    const desc = elements.form.desc.value;
    const amount = parseFloat(elements.form.amount.value);
    const category = elements.form.category.value;
    if (desc && amount > 0) {
        AppState.expenses.push({ id: Date.now(), description: desc, amount: amount, category: category, timestamp: AppState.currentViewDate.toISOString() });
        localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(AppState.expenses));
        elements.form.desc.value = ''; elements.form.amount.value = '';
        render(); showToast("Dépense enregistrée");
    }
};

window.deleteExpense = (id) => {
    AppState.expenses = AppState.expenses.filter(e => e.id !== id);
    localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(AppState.expenses));
    render();
};

function showToast(msg) {
    elements.toast.textContent = msg;
    elements.toast.classList.add('show');
    setTimeout(() => elements.toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', init);