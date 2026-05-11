/**
 * 💰 Budget Pixel - Application de suivi des dépenses
 * Version 3.1.0 - Intégration des Graphiques avec Chart.js
 */

// ... APP_CONFIG et AppState (restent identiques) ...

const APP_CONFIG = {
    version: '3.1.0', // Mise à jour de la version
    lastUpdated: new Date().toISOString(),
    name: 'Budget Pixel',
    storageKey: 'budgetPixelExpenses',
    budgetKey: 'budgetPixelBudget'
};

// ... AppState (reste identique) ...

// ============================================
// 📱 DOM ELEMENTS
// ============================================

const elements = {
    // ... formulaires, display, filters ...

    // Stats (MIS À JOUR POUR LES CANVAS)
    statTotal: document.getElementById('stat-total'),
    statCount: document.getElementById('stat-count'),
    statAverage: document.getElementById('stat-average'),
    statMax: document.getElementById('stat-max'),
    // Nouveaux éléments Canvas
    categoryChart: document.getElementById('categoryChart'),
    dailyChart: document.getElementById('dailyChart'),
    
    // ... settings, navigation, toast ...
};

// Variable globale pour stocker les instances des graphiques
let charts = {
    category: null,
    daily: null
};

// ... UTILITY FUNCTIONS (restent identiques : formatDate, shoxToast, escapeHTML...) ...

// ... DATA MANAGEMENT (restent identiques : saveExpenses, addExpense, deleteExpense...) ...

// ============================================
// 🎯 RENDERING FUNCTIONS
// ============================================

// ... renderExpensesList et renderBudget (restent identiques) ...

/**
 * Affiche les statistiques avec des graphiques Chart.js
 */
function renderStats() {
    console.log('📈 Mise à jour des graphiques...');
    const total = AppState.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const count = AppState.expenses.length;
    const average = count > 0 ? total / count : 0;
    const max = count > 0 ? Math.max(...AppState.expenses.map(e => e.amount)) : 0;
    
    elements.statTotal.textContent = total.toFixed(2) + ' €';
    elements.statCount.textContent = count;
    elements.statAverage.textContent = average.toFixed(2) + ' €';
    elements.statMax.textContent = max.toFixed(2) + ' €';

    // Si aucune dépense, on ne dessine pas les graphiques
    if (count === 0) {
        if (charts.category) charts.category.destroy();
        if (charts.daily) charts.daily.destroy();
        // Optionnel : afficher un message "Aucune donnée" par-dessus les canvas
        return;
    }

    // 1. Préparation des données pour le graphique par catégorie
    const byCategory = {};
    AppState.expenses.forEach(exp => {
        byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    });
    const catLabels = Object.keys(byCategory);
    const catData = Object.values(byCategory);

    // 2. Préparation des données pour le graphique quotidien (7 derniers jours)
    const byDay = {};
    AppState.expenses.forEach(exp => {
        // Utiliser timestamp pour trier chronologiquement, pas la date formatée
        const dateKey = exp.timestamp.split('T')[0]; // YYYY-MM-DD
        byDay[dateKey] = (byDay[dateKey] || 0) + exp.amount;
    });

    // Créer une liste des 7 derniers jours (chronologique)
    const dailyLabels = [];
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        
        // Label formaté pour l'affichage (JJ/MM)
        const displayLabel = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(d);
        dailyLabels.push(displayLabel);
        dailyData.push(byDay[dateKey] || 0); // 0 si aucune dépense ce jour-là
    }

    // 3. Dessiner/Mettre à jour le graphique par catégorie (Doughnut)
    if (charts.category) charts.category.destroy(); // Important !
    charts.category = new Chart(elements.categoryChart, {
        type: 'doughnut',
        data: {
            labels: catLabels,
            datasets: [{
                label: 'Dépenses (€)',
                data: catData,
                backgroundColor: [
                    '#1a73e8', // primary
                    '#0d652d', // success
                    '#f57f17', // warning
                    '#d93025', // danger
                    '#a142f4', // purple
                    '#ff6d00', // orange
                    '#24c1e0'  // cyan
                ],
                borderWidth: 2,
                borderColor: getComputedStyle(document.body).getPropertyValue('--bg') // Adaptation dark mode
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text') // Adaptation dark mode
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value.toFixed(2)} € (${percent}%)`;
                        }
                    }
                }
            }
        }
    });

    // 4. Dessiner/Mettre à jour le graphique quotidien (Bar)
    if (charts.daily) charts.daily.destroy(); // Important !
    charts.daily = new Chart(elements.dailyChart, {
        type: 'bar',
        data: {
            labels: dailyLabels,
            datasets: [{
                label: 'Dépenses quotidiennes (€)',
                data: dailyData,
                backgroundColor: '#1a73e8',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary') // Adaptation dark mode
                    },
                    grid: {
                        color: getComputedStyle(document.body).getPropertyValue('--border') // Adaptation dark mode
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-secondary') // Adaptation dark mode
                    },
                    grid: {
                        display: false // Masquer la grille X pour plus de clarté
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Pas besoin de légende pour une seule série
                }
            }
        }
    });
}

// ... render principal (reste identique, mais renderStats est maintenant appelé différemment) ...

// ============================================
// 🚀 INITIALIZATION
// ============================================

function init() {
    // Afficher la version (v3.1.0)
    elements.appVersion.textContent = `v${APP_CONFIG.version} • ${formatDate(APP_CONFIG.lastUpdated)}`;
    
    // ... Charger le budget et enregistrer le service worker ...
    
    // Le Service Worker peut aussi mettre en cache le script de Chart.js
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('✅ Service Worker enregistré'))
            .catch(err => console.warn('⚠️ Service Worker non enregistré:', err));
    }

    // Le rendu initial n'appelle pas renderStats()
    // Car les canvas ne sont pas visibles et Chart.js a besoin qu'ils le soient pour bien calculer leur taille
    renderExpensesList();
    renderBudget();
    
    console.log('🚀 Budget Pixel v3.1.0 initialisé');
}

// Lancer l'app quand le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}