export class RollChangeEventData {
    indexOfFrame: number;

    constructor(init?: Partial<RollChangeEventData>) {
        this.indexOfFrame = null;

        Object.assign(this, init);
    }
}