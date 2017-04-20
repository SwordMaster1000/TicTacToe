class Ui {
    constructor(messager) {
        this.messager = document.querySelector(messager);
    }

    switchViewTo(text) {
        this.hide().then(() => {
            this.show(text);
        });
    }

    hide() {
        return new Promise((resolve, reject) => {
            this.messager.classList.add('hide');
            setTimeout(resolve, 500);
        });
    }

    show(text) {
        this.messager.textContent = text;
        this.messager.classList.remove('hide');
        if (game.status === 'ended')
            document.body.classList.add('ended');
    }

    placeAt(pos, turn) {
        let square = document.querySelector(`[data-indx="${pos + 1}"]`);
        square.classList.add(turn);
        square.classList.add('occupied');
    }
}