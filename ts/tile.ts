
interface TilePosition {
    x: number;
    y: number
}

interface SerializedTile {
    position: TilePosition;
    value: number;
}

class Tile {
    previousPosition: TilePosition;
    mergedFrom: Tile[];

    constructor(
        position: TilePosition,
        value: number)
    constructor(position: TilePosition,
        public value = 2,
        public x = position.x,
        public y = position.y) {
    }

    savePosition() {
        this.previousPosition = { x: this.x, y: this.y };
    };

    updatePosition(position) {
        this.x = position.x;
        this.y = position.y;
    };

    serialize(): SerializedTile{
        return {
            position: {
                x: this.x,
                y: this.y
            },
            value: this.value
        };
    };
}
