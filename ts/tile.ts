module App {
    export class Tile {
        previousPosition: Position;
        mergedFrom: Tile[];

        constructor(
            position: Position,
            value: number)
        constructor(position: Position,
            public value = 2,
            public x = position.x,
            public y = position.y) {
        }

        savePosition() {
            this.previousPosition = { x: this.x, y: this.y };
        };

        updatePosition(position: Position) {
            this.x = position.x;
            this.y = position.y;
        };

        serialize(): SerializedTile {
            return {
                position: {
                    x: this.x,
                    y: this.y
                },
                value: this.value
            };
        };
    }
}