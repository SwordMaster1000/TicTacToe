/*
 * Constructs an AI player with a specific level of intelligence
 * @param level [String]: the desired level of intelligence
 */
class Ai {

    constructor(level) {
        //private attribute: level of intelligence the player has
        this._levelOfIntelligence = level;

        //private attribute: the game the player is playing
        this._game = {};
        this._makeMasterMove = this._makeMasterMove.bind(this);
        this._minimaxValue = this._minimaxValue.bind(this);
    }

    /*
    * private recursive function that computes the minimax value of a game state
    * @param state [State] : the state to calculate its minimax value
    * @returns [Number]: the minimax value of the state
    */
    _minimaxValue(state) {
        if (state.isTerminal()) {
            //a terminal game state is the base case
            return Game.score(state);
        }
        else {
            var stateScore; // this stores the minimax value we'll compute

            if (state.turn === "X")
                // X maximizs --> initialize to a value smaller than any possible score
                stateScore = -1000;
            else
                // O minimizes --> initialize to a value larger than any possible score
                stateScore = 1000;

            var availablePositions = state.emptyCells();

            //enumerate next available states using the info form available positions
            var availableNextStates = availablePositions.map(function (pos) {
                var action = new AiAction(pos);

                var nextState = action.applyTo(state);

                return nextState;
            });

            /* calculate the minimax value for all available next states
             * and evaluate the current state's value */
            availableNextStates.forEach(function (nextState) {

                var nextScore = this._minimaxValue(nextState); //recursive call

                if (state.turn === "X") {
                    // X wants to maximize --> update stateScore if nextScore is larger
                    if (nextScore > stateScore)
                        stateScore = nextScore;
                }
                else {
                    // O wants to minimize --> update stateScore if nextScore is smaller
                    if (nextScore < stateScore)
                        stateScore = nextScore;
                }
            }.bind(this));

            //backup the minimax value
            return stateScore;
        }
    }

    /*
    * private function: make the ai player take a novice move,
    * that is: mix between choosing the optimal and suboptimal minimax decisions
    * @param turn [String]: the player to play, either X or O
    */
    _makeNoviceMove(turn) {
        var available = game.currentState.emptyCells();

        //enumerate and calculate the score for each available actions to the ai player
        var availableActions = available.map(function (pos) {
            var action = new AIAction(pos); //create the action object

            //get next state by applying the action
            var nextState = action.applyTo(game.currentState);

            //calculate and set the action's minimax value
            action.minimaxVal = _minimaxValue(nextState);

            return action;
        });

        //sort the enumerated actions list by score
        if (turn === "X")
            //X maximizes --> decend sort the actions to have the maximum minimax at first
            availableActions.sort(AIAction.DESCENDING);
        else
            //O minimizes --> ascend sort the actions to have the minimum minimax at first
            availableActions.sort(AIAction.ASCENDING);


        /*
         * take the optimal action 40% of the time
         * take the 1st suboptimal action 60% of the time
         */
        var chosenAction;
        if (Math.random() * 100 <= 40) {
            chosenAction = availableActions[0];
        }
        else {
            if (availableActions.length >= 2) {
                //if there is two or more available actions, choose the 1st suboptimal
                chosenAction = availableActions[1];
            }
            else {
                //choose the only available actions
                chosenAction = availableActions[0];
            }
        }
        var next = chosenAction.applyTo(game.currentState);

        ui.insertAt(chosenAction.movePosition, turn);

        game.advanceTo(next);
    };

    /*
    * private function: make the ai player take a master move,
    * that is: choose the optimal minimax decision
    * @param turn [String]: the player to play, either X or O
    */
    _makeMasterMove(turn) {
        var available = game.currentState.emptyCells();

        //enumerate and calculate the score for each avaialable actions to the ai player
        var availableActions = available.map(function (pos) {
            var action = new AiAction(pos); //create the action object

            //get next state by applying the action
            var next = action.applyTo(game.currentState);

            //calculate and set the action's minmax value
            action.minimaxVal = this._minimaxValue(next);
            return action;
        }.bind(this));

        //sort the enumerated actions list by score
        if (turn === "X")
            //X maximizes --> descend sort the actions to have the largest minimax at first
            availableActions.sort(AiAction.DESCENDING);
        else
            //O minimizes --> acend sort the actions to have the smallest minimax at first
            availableActions.sort(AiAction.ASCENDING);


        //take the first action as it's the optimal
        var chosenAction = availableActions[0];
        var next = chosenAction.applyTo(game.currentState);

        // this just adds an X or an O at the chosen position on the board in the UI
        ui.placeAt(chosenAction.movePosition, turn);

        // take the game to the next state
        game.advanceTo(next);
    }


    /*
     * public method to specify the game the ai player will play
     * @param _game [Game] : the game the ai will play
     */
    plays(_game) {
        this._game = _game;
    }

    /*
     * public function: notify the ai player that it's its turn
     * @param turn [String]: the player to play, either X or O
     */
    notify(turn) {
        switch (this._levelOfIntelligence) {
            //invoke the desired behavior based on the level chosen
            case "novice": this._makeNoviceMove(turn); break;
            case "master": this._makeMasterMove(turn); break;
        }
    }
}

/*
 * Constructs an action that the ai player could make
 * @param pos [Number]: the cell position the ai would make its action in
 * made that action
 */
class AiAction {
    constructor(pos) {
        // the position on the board that the action would put the letter on
        this.movePosition = pos;

        //the minimax value of the state that the action leads to when applied
        this.minimaxVal = 0;

    }

    /*
     * applies the action to a state to get the next state
     * @param state [State]: the state to apply the action to
     * @return [State]: the next state
     */
    applyTo(state) {
        var next = new State(state);

        //put the letter on the board
        next.board[this.movePosition] = state.turn;

        if (state.turn === "O")
            next.oMovesCount++;

        next.advanceTurn();

        return next;
    }
}

/*
* public static method that defines a rule for sorting AIAction in ascending manner
* @param firstAction [AIAction] : the first action in a pairwise sort
* @param secondAction [AIAction]: the second action in a pairwise sort
* @return [Number]: -1, 1, or 0
*/
AiAction.ASCENDING = (firstAction, secondAction) => {
    if (firstAction.minimaxVal < secondAction.minimaxVal)
        return -1; //indicates that firstAction goes before secondAction
    else if (firstAction.minimaxVal > secondAction.minimaxVal)
        return 1; //indicates that secondAction goes before firstAction
    else
        return 0; //indicates a tie
}

/*
 * public static method that defines a rule for sorting AIAction in descending manner
 * @param firstAction [AIAction] : the first action in a pairwise sort
 * @param secondAction [AIAction]: the second action in a pairwise sort
 * @return [Number]: -1, 1, or 0
 */
AiAction.DESCENDING = (firstAction, secondAction) => {
    if (firstAction.minimaxVal > secondAction.minimaxVal)
        return -1; //indicates that firstAction goes before secondAction
    else if (firstAction.minimaxVal < secondAction.minimaxVal)
        return 1; //indicates that secondAction goes before firstAction
    else
        return 0; //indicates a tie
}