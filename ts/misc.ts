module App {
    export interface Position {
        x: number;
        y: number
    }

    export interface SerializedTile {
        position: Position;
        value: number;
    }

    export interface SerializedGrid {
        size: number,
        cells: SerializedTile[][]
    }

    export interface SerializedGame {
        grid: SerializedGrid;
        score: number;
        over: boolean;
        won: boolean;
        keepPlaying: boolean;
    }

    export enum MoveDirection {
        up = 0,
        right = 1,
        down = 2,
        left = 3
    }

    export interface MoveVector {
        x: number;
        y: number;
    }

    export interface Metadata {
        score: number,
        over: boolean,
        won: boolean,
        bestScore: number,
        terminated: boolean
    }
}