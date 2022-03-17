export class RollValidationErrorEventData {
    validationMessage: string;

    constructor(init?: Partial<RollValidationErrorEventData>) {
        this.validationMessage = null;

        Object.assign(this, init);
    }
}