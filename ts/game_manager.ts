module App {
    export class GameManager {
        private inputManager: KeyboardInputManager;
        private storageManager: LocalStorageManager;
        private actuator: HTMLActuator;
        private startTiles: number;
    
        // previously inexplicit state variables
        private _keepPlaying: boolean;
        private over: boolean;
        private won: boolean;
        private grid: Grid;
        private score: number;

        constructor(
            private size: number,
            InputManager: typeof KeyboardInputManager,
            Actuator: typeof HTMLActuator,
            StorageManager: typeof LocalStorageManager) {

            this.inputManager = new InputManager;
            this.storageManager = new StorageManager;
            this.actuator = new Actuator;

            this.startTiles = 2;

            this.inputManager.on("move", this.move.bind(this));
            this.inputManager.on("restart", this.restart.bind(this));
            this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

            this.setup();
        }

        // Restart the game
        private restart() {
            this.storageManager.clearGameState();
            this.actuator.continueGame(); // Clear the game won/lost message
            this.setup();
        };

        // Keep playing after winning (allows going over 2048)
        private keepPlaying() {
            this._keepPlaying = true;
            this.actuator.continueGame(); // Clear the game won/lost message
        };

        // Return true if the game is lost, or has won and the user hasn't kept playing
        private isGameTerminated() {
            return this.over || (this.won && !this._keepPlaying);
        };

        // Set up the game
        private setup() {
            var previousState = this.storageManager.getGameState();

            // Reload the game from a previous game if present
            if (previousState) {
                this.grid = new Grid(previousState.grid.size,
                    previousState.grid.cells); // Reload grid
                this.score = previousState.score;
                this.over = previousState.over;
                this.won = previousState.won;
                this._keepPlaying = previousState.keepPlaying;
            } else {
                this.grid = new Grid(this.size);
                this.score = 0;
                this.over = false;
                this.won = false;
                this._keepPlaying = false;

                // Add the initial tiles
                this.addStartTiles();
            }

            // Update the actuator
            this.actuate();
        };

        // Set up the initial tiles to start the game with
        private addStartTiles() {
            for (var i = 0; i < this.startTiles; i++) {
                this.addRandomTile();
            }
        };

        // Adds a tile in a random position
        private addRandomTile() {
            if (this.grid.cellsAvailable()) {
                var value = Math.random() < 0.9 ? 2 : 4;
                var tile = new Tile(this.grid.randomAvailableCell(), value);

                this.grid.insertTile(tile);
            }
        };

        // Sends the updated grid to the actuator
        private actuate() {
            if (this.storageManager.getBestScore() < this.score) {
                this.storageManager.setBestScore(this.score);
            }

            // Clear the state when the game is over (game over only, not win)
            if (this.over) {
                this.storageManager.clearGameState();
            } else {
                this.storageManager.setGameState(this.serialize());
            }

            this.actuator.actuate(this.grid, {
                score: this.score,
                over: this.over,
                won: this.won,
                bestScore: this.storageManager.getBestScore(),
                terminated: this.isGameTerminated()
            });

        };

        // Represent the current game as an object
        private serialize(): SerializedGame {
            return {
                grid: this.grid.serialize(),
                score: this.score,
                over: this.over,
                won: this.won,
                keepPlaying: this._keepPlaying
            };
        };

        // Save all tile positions and remove merger info
        private prepareTiles() {
            this.grid.eachCell((x, y, tile) => {
                if (tile) {
                    tile.mergedFrom = null;
                    tile.savePosition();
                }
            });
        };

        // Move a tile and its representation
        private moveTile(tile: Tile, cell: Position) {
            this.grid.cells[tile.x][tile.y] = null;
            this.grid.cells[cell.x][cell.y] = tile;
            tile.updatePosition(cell);
        };

        // Move tiles on the grid in the specified direction
        private move(direction: MoveDirection) {
            // 0: up, 1: right, 2: down, 3: left
            if (this.isGameTerminated()) return; // Don't do anything if the game's over

            var cell: Position, tile: Tile;

            var vector = this.getVector(direction);
            var traversals = this.buildTraversals(vector);
            var moved = false;

            // Save the current tile positions and remove merger information
            this.prepareTiles();

            // Traverse the grid in the right direction and move tiles
            traversals.x.forEach((x) => {
                traversals.y.forEach((y) => {
                    cell = { x: x, y: y };
                    tile = this.grid.cellContent(cell);

                    if (tile) {
                        var positions = this.findFarthestPosition(cell, vector);
                        var next = this.grid.cellContent(positions.next);

                        // Only one merger per row traversal?
                        if (next && next.value === tile.value && !next.mergedFrom) {
                            var merged = new Tile(positions.next, tile.value * 2);
                            merged.mergedFrom = [tile, next];

                            this.grid.insertTile(merged);
                            this.grid.removeTile(tile);

                            // Converge the two tiles' positions
                            tile.updatePosition(positions.next);

                            // Update the score
                            this.score += merged.value;

                            // The mighty 2048 tile
                            if (merged.value === 2048) this.won = true;
                        } else {
                            this.moveTile(tile, positions.farthest);
                        }

                        if (!this.positionsEqual(cell, tile)) {
                            moved = true; // The tile moved from its original cell!
                        }
                    }
                });
            });

            if (moved) {
                this.addRandomTile();

                if (!this.movesAvailable()) {
                    this.over = true; // Game over!
                }

                this.actuate();
            }
        };

        // Get the vector representing the chosen direction
        private getVector(direction: MoveDirection) {
            // Vectors representing tile movement
            var map = {
                0: { x: 0, y: -1 }, // Up
                1: { x: 1, y: 0 },  // Right
                2: { x: 0, y: 1 },  // Down
                3: { x: -1, y: 0 }   // Left
            };

            return <MoveVector>(<any>map)[direction];
        };

        // Build a list of positions to traverse in the right order
        private buildTraversals(vector: MoveVector) {
            var traversals = { x: <number[]>[], y: <number[]>[] };

            for (var pos = 0; pos < this.size; pos++) {
                traversals.x.push(pos);
                traversals.y.push(pos);
            }

            // Always traverse from the farthest cell in the chosen direction
            if (vector.x === 1) traversals.x = traversals.x.reverse();
            if (vector.y === 1) traversals.y = traversals.y.reverse();

            return traversals;
        };

        private findFarthestPosition(cell: Position, vector: MoveVector) {
            var previous: Position;

            // Progress towards the vector direction until an obstacle is found
            do {
                previous = cell;
                cell = { x: previous.x + vector.x, y: previous.y + vector.y };
            } while (this.grid.withinBounds(cell) &&
                this.grid.cellAvailable(cell));

            return {
                farthest: previous,
                next: cell // Used to check if a merge is required
            };
        };

        private movesAvailable() {
            return this.grid.cellsAvailable() || this.tileMatchesAvailable();
        };

        // Check for available matches between tiles (more expensive check)
        private tileMatchesAvailable() {
            var tile: Tile;

            for (var x = 0; x < this.size; x++) {
                for (var y = 0; y < this.size; y++) {
                    tile = this.grid.cellContent({ x: x, y: y });

                    if (tile) {
                        for (var direction = 0; direction < 4; direction++) {
                            var vector = this.getVector(direction);
                            var cell = { x: x + vector.x, y: y + vector.y };

                            var other = this.grid.cellContent(cell);

                            if (other && other.value === tile.value) {
                                return true; // These two tiles can be merged
                            }
                        }
                    }
                }
            }

            return false;
        };

        private positionsEqual(first: Position, second: Position) {
            return first.x === second.x && first.y === second.y;
        };
    }
}