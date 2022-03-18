export class FrameRolls {
    roll1: number;
    roll2: number;
    roll3: number;

    constructor(init?: Partial<FrameRolls>) {
        this.roll1 = null;
        this.roll2 = null;
        this.roll3 = null;

        Object.assign(this, init);
    }
}