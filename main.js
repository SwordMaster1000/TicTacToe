window.ui = new Ui();
let start = level => {
    window.ai = new Ai(level);
    window.game = new Game(ai);
    ai.plays(game);
    game.start();

    document.querySelectorAll('.square').forEach(function (el) {
        el.addEventListener('click', e => {
            if (game.status === "running" && game.currentState.turn === "X" && !e.target.classList.contains('occupied')) {
                var indx = e.target.dataset.indx - 1;

                var next = new State(game.currentState);
                next.board[indx] = "X";

                ui.placeAt(indx, "X");

                next.advanceTurn();

                game.advanceTo(next);

            }
        });
    });
}

start('master');