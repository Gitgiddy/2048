module App {
    export class Grid {
        cells: Tile[][];

        constructor(private size: number, previousState?: SerializedTile[][]) {
            this.size = size;
            this.cells = previousState ? this.fromState(previousState) : this.empty();
        }

        // Build a grid of the specified size
        empty() {
            var cells: Tile[][] = [];

            for (var x = 0; x < this.size; x++) {
                var row: Tile[] = cells[x] = [];

                for (var y = 0; y < this.size; y++) {
                    row.push(null);
                }
            }

            return cells;
        };

        fromState(state: SerializedTile[][]) {
            var cells: Tile[][] = [];

            for (var x = 0; x < this.size; x++) {
                var row: Tile[] = cells[x] = [];

                for (var y = 0; y < this.size; y++) {
                    var tile = state[x][y];
                    row.push(tile ? new Tile(tile.position, tile.value) : null);
                }
            }

            return cells;
        };

        // Find the first available random position
        randomAvailableCell() {
            var cells = this.availableCells();

            if (cells.length) {
                return cells[Math.floor(Math.random() * cells.length)];
            }
        };

        availableCells() {
            var cells: { x: number, y: number }[] = [];

            this.eachCell(function (x, y, tile) {
                if (!tile) {
                    cells.push({ x: x, y: y });
                }
            });

            return cells;
        };

        // Call callback for every cell
        eachCell(callback: (x: number, y: number, tile: Tile) => void) {
            for (var x = 0; x < this.size; x++) {
                for (var y = 0; y < this.size; y++) {
                    callback(x, y, this.cells[x][y]);
                }
            }
        };

        // Check if there are any cells available
        cellsAvailable() {
            return !!this.availableCells().length;
        };

        // Check if the specified cell is taken
        cellAvailable(cell: Position) {
            return !this.cellOccupied(cell);
        };

        cellOccupied(cell: Position) {
            return !!this.cellContent(cell);
        };

        cellContent(cell: Position) {
            if (this.withinBounds(cell)) {
                return this.cells[cell.x][cell.y];
            } else {
                return null;
            }
        };

        // Inserts a tile at its position
        insertTile(tile: Tile) {
            this.cells[tile.x][tile.y] = tile;
        };

        removeTile(tile: Tile) {
            this.cells[tile.x][tile.y] = null;
        };

        withinBounds(position: Position) {
            return position.x >= 0 && position.x < this.size &&
                position.y >= 0 && position.y < this.size;
        };

        serialize(): SerializedGrid {
            var cellState: SerializedTile[][] = [];

            for (var x = 0; x < this.size; x++) {
                var row: SerializedTile[] = cellState[x] = [];

                for (var y = 0; y < this.size; y++) {
                    row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
                }
            }

            return {
                size: this.size,
                cells: cellState
            };
        };
    }
}