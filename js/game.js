export class Game {
    constructor(ui) {
        this.ui = ui;
        this.resources = {
            rna: { name: 'RNA', amount: 0, max: 100, rate: 0, unlocked: true },
            dna: { name: 'DNA', amount: 0, max: 10, rate: 0, unlocked: false },
            protein: { name: '단백질 (Protein)', amount: 0, max: 50, rate: 0, unlocked: false }
        };

        this.lastTick = Date.now();
        this.tickRate = 100; // Run tick every 100ms

        // Game State flags
        this.flags = {
            dnaUnlocked: false
        };
        this.upgrades = {
            organelle: {
                name: '세포소기관 (Organelle)',
                cost: { rna: 15 },
                effect: { rna_rate: 1 },
                count: 0,
                unlocked: true,
                desc: "RNA를 자동으로 생산합니다. (+1/sec)"
            },
            membrane: {
                name: '세포 막 (Cell Membrane)',
                cost: { rna: 40 },
                effect: { rna_max: 50 },
                count: 0,
                unlocked: true,
                desc: "RNA 저장 용량을 늘립니다. (+50 Max)"
            }
        };
    }

    start() {
        console.log("Game Started");
        this.ui.init(this);

        // Start Loop
        window.requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    loop(timestamp) {
        const now = Date.now();
        const dt = (now - this.lastTick) / 1000; // delta time in seconds

        if (dt >= 0.1) { // Update at least every 100ms
            this.tick(dt);
            this.lastTick = now;
        }

        window.requestAnimationFrame((t) => this.loop(t));
    }

    tick(dt) {
        // Calculate rates based on upgrades
        this.resources.rna.rate = this.upgrades.organelle.count * 1;

        // Produce resources
        for (const key in this.resources) {
            const res = this.resources[key];
            if (res.unlocked) { // Even if rate is 0, we update for UI mostly, but logic holds
                if (res.rate > 0) {
                    res.amount += res.rate * dt;
                }
                if (res.amount > res.max) res.amount = res.max;
            }
        }

        this.ui.update(this);
    }

    // Actions
    clickRna() {
        this.addResource('rna', 1);
        this.ui.log("RNA를 합성했습니다.");
        this.checkUnlocks();
    }

    buyUpgrade(id) {
        const upgrade = this.upgrades[id];
        if (!upgrade) return;

        // Check costs
        let canBuy = true;
        for (const res in upgrade.cost) {
            if (this.resources[res].amount < upgrade.cost[res]) {
                canBuy = false;
                break;
            }
        }

        if (canBuy) {
            // Deduct cost
            for (const res in upgrade.cost) {
                this.resources[res].amount -= upgrade.cost[res];
            }
            // Apply upgrade
            upgrade.count++;

            // Logic for static effects (like Max)
            if (upgrade.effect.rna_max) {
                this.resources.rna.max += upgrade.effect.rna_max;
            }

            // Scaling cost (simple 1.5x)
            for (const res in upgrade.cost) {
                upgrade.cost[res] = Math.ceil(upgrade.cost[res] * 1.5);
            }

            this.ui.log(`${upgrade.name}을(를) 진화시켰습니다.`);
            this.ui.updateUpgrades(this); // Refresh buttons
        } else {
            this.ui.log("자원이 부족합니다.", "warning");
        }
    }

    checkUnlocks() {
        // Unlock DNA check
        if (!this.flags.dnaUnlocked && this.resources.rna.amount >= 10) {
            this.resources.dna.unlocked = true;
            this.flags.dnaUnlocked = true;
            this.ui.log("RNA가 충분해져 DNA 구조가 보이기 시작합니다!", "new");
            this.ui.unlockTab('evolution');
            this.ui.init(this); // Re-render to show DNA
        }
    }

    buyDna() {
        if (this.resources.rna.amount >= 10) {
            this.resources.rna.amount -= 10;
            this.addResource('dna', 1);
            this.ui.log("DNA 서열을 정리했습니다.");
        }
    }

    addResource(key, amount) {
        if (this.resources[key]) {
            this.resources[key].amount += amount;
            if (this.resources[key].amount > this.resources[key].max) {
                this.resources[key].amount = this.resources[key].max;
            }
        }
    }
}
