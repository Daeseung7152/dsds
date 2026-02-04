import { Game } from './game.js';
import { UIManager } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UIManager();
    const game = new Game(ui);

    game.start();

    // Debug
    window.game = game;
});
