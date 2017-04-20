class Ui {
    switchViewTo(view) {
        console.log('Switched: ', view);
    }

    placeAt(pos, turn) {
        let square = document.querySelector(`[data-indx="${pos + 1}"]`);
        square.classList.add(turn);
        square.classList.add('occupied');
    }
}