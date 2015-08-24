module App {
    export class LocalStorageManager {
        private static bestScoreKey = "bestScore";
        private static gameStateKey = "gameState";

        private static fakeStorage = new FakeStorage();

        private storage: Storage;

        constructor() {
            var supported = this.localStorageSupported();

            // Fake storage is not fully implementing the Storage interface but the 
            // code was happy with it so we'll force Typescript to accept it.
            this.storage = supported ? window.localStorage : <Storage><any>LocalStorageManager.fakeStorage;

            // strictly speaking, do we need to allocate the fake storage prior to use?
        }

        private localStorageSupported() {
            var testKey = "test";
            var storage = window.localStorage;

            try {
                storage.setItem(testKey, "1");
                storage.removeItem(testKey);
                return true;
            } catch (error) {
                return false;
            }
        };

        // Best score getters/setters
        getBestScore() {
            return this.storage.getItem(LocalStorageManager.bestScoreKey) || 0;
        };

        setBestScore(score: number) {
            this.storage.setItem(LocalStorageManager.bestScoreKey, score.toString(10));
        };

        // Game state getters/setters and clearing
        getGameState(): SerializedGame {
            var stateJSON = this.storage.getItem(LocalStorageManager.gameStateKey);
            return stateJSON ? JSON.parse(stateJSON) : null;
        };

        setGameState(gameState: SerializedGame) {
            this.storage.setItem(LocalStorageManager.gameStateKey, JSON.stringify(gameState));
        };

        clearGameState() {
            this.storage.removeItem(LocalStorageManager.gameStateKey);
        };
    }
}