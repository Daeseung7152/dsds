export class UIManager {
    constructor() {
        this.resourceContainer = document.getElementById('resource-container');
        this.logContainer = document.getElementById('log-container');
        this.actionContainers = {
            evolution: document.getElementById('evolution-actions'),
            civilization: document.getElementById('civ-actions'),
            science: document.getElementById('science-actions')
        };
    }

    init(game) {
        this.createResourceElements(game.resources);
        this.createButtons(game);
        this.setupTabs();
    }

    createResourceElements(resources) {
        this.resourceContainer.innerHTML = '';
        for (const key in resources) {
            if (!resources[key].unlocked) continue;

            const div = document.createElement('div');
            div.className = 'resource-item';
            div.id = `res-${key}`;
            div.innerHTML = `
                <span class="resource-name">${resources[key].name}</span>
                <div>
                    <span class="resource-val" id="val-${key}">0</span>
                    <span class="resource-val" style="color:#666; font-size:0.8em"> / </span>
                    <span class="resource-val" id="max-${key}" style="color:#666; font-size:0.8em">${resources[key].max}</span>
                    <span class="resource-rate" id="rate-${key}">(+0/s)</span>
                </div>
            `;
            this.resourceContainer.appendChild(div);
        }
    }

    createButtons(game) {
        // Evolution Tab Actions
        const evoContainer = this.actionContainers.evolution;
        evoContainer.innerHTML = '';

        // Create RNA Button (Always there for now)
        const rnaBtn = document.createElement('button');
        rnaBtn.className = 'action-btn';
        rnaBtn.innerText = "RNA 합성 (+1 RNA)";
        rnaBtn.onclick = () => game.clickRna();
        evoContainer.appendChild(rnaBtn);

        // Upgrades
        for (const key in game.upgrades) {
            const upg = game.upgrades[key];
            if (!upg.unlocked) continue;

            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.id = `btn-upg-${key}`;
            btn.onclick = () => game.buyUpgrade(key);
            this.updateUpgradeButtonText(btn, upg);
            evoContainer.appendChild(btn);
        }

        // DNA Button (Special case logic or just another upgrade? Kept separate for now)
        if (game.resources.dna.unlocked) {
            const dnaBtn = document.createElement('button');
            dnaBtn.className = 'action-btn';
            dnaBtn.id = 'btn-dna';
            dnaBtn.innerText = "DNA 형성 (10 RNA)";
            dnaBtn.onclick = () => game.buyDna();
            evoContainer.appendChild(dnaBtn);
        }
    }

    updateUpgradeButtonText(btn, upg) {
        let costText = Object.entries(upg.cost).map(([k, v]) => `${v} ${k.toUpperCase()}`).join(', ');
        btn.innerHTML = `
            <div>${upg.name} <span style='font-size:0.8em; color:#888'>(Lv.${upg.count})</span></div>
            <div style='font-size:0.8em; color:#aaa'>${upg.desc}</div>
            <div style='font-size:0.8em; color:${'var(--highlight-color)'}'>비용: ${costText}</div>
        `;
    }

    updateUpgrades(game) {
        // Re-render text for price updates
        for (const key in game.upgrades) {
            const btn = document.getElementById(`btn-upg-${key}`);
            if (btn) {
                this.updateUpgradeButtonText(btn, game.upgrades[key]);
            }
        }
        // Also update max display if it changed
        for (const key in game.resources) {
            const maxEl = document.getElementById(`max-${key}`);
            if (maxEl) maxEl.innerText = game.resources[key].max;
        }
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                // Add to clicked
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });
    }

    update(game) { // Changed parameter to 'game' to access upgrades and resources
        // Update resource values
        for (const key in game.resources) {
            if (!game.resources[key].unlocked) continue;

            if (!document.getElementById(`res-${key}`)) {
                // Ideally trigger a full re-render or targeted separate render
                continue;
            }

            const valEl = document.getElementById(`val-${key}`);
            if (valEl) valEl.innerText = Math.floor(game.resources[key].amount);

            const rateEl = document.getElementById(`rate-${key}`);
            if (rateEl) rateEl.innerText = `(+${game.resources[key].rate.toFixed(1)}/s)`;
        }

        // Check for specific UI visibility updates
        // This should ideally be event driven or state checked specifically
        if (game.resources.rna.amount >= 10 || game.resources.dna.unlocked) {
            const dnaBtn = document.getElementById('btn-dna');
            if (dnaBtn) dnaBtn.style.display = 'inline-block';
        }

        this.updateUpgrades(game); // Update upgrade button states and resource max values
    }

    log(message, type = 'normal') {
        const div = document.createElement('div');
        div.className = 'log-entry';
        if (type === 'new') div.classList.add('log-new');

        const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
        div.innerText = `[${time}] ${message}`;

        this.logContainer.prepend(div);

        // Limit log size
        if (this.logContainer.children.length > 50) {
            this.logContainer.lastChild.remove();
        }
    }

    unlockTab(tabId) {
        // Logic to show hidden tabs
    }
}
