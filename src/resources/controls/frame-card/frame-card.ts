import { autoinject } from "aurelia-framework";
import { bindable, observable, computedFrom } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";
import { EventEnum } from "resources/enums/event-enum";
import { RollChangeEventData } from "resources/entities/roll-change-event-data";
import { RollValidationErrorEventData } from "resources/entities/roll-validation-error-event-data";

@autoinject
export class FrameCardCustomElement {
    // injected
    private eventAggregator: EventAggregator;

    // bindables
    @bindable public index: number;
    @bindable private name: string;
    @bindable public isLastFrame: boolean;
    @bindable private scoreCardId: number;

    // observables
    @observable public roll1: number;
    @observable public roll2: number;
    @observable public roll3: number;

    // data
    public score: number;

    // computed props
    @computedFrom("roll1", "roll2")
    public get isStrike(): boolean {
        return +this.roll1 === 10 ? true : false;
    }
    @computedFrom("roll1", "roll2")
    public get isSpare(): boolean {
        // A strike is also a spare intentionally, so the computeScore function is cleaner
        return (+this.roll1 + +this.roll2 === 10) ? true : false;
    }
    @computedFrom("roll1", "isLastFrame")
    public get showStrike1(): boolean {
        return this.isLastFrame && +this.roll1 === 10 ? true : false;
    }
    @computedFrom("roll1", "roll2", "isLastFrame")
    public get showStrike2(): boolean {
        return this.isLastFrame && +this.roll1 === 10 && +this.roll2 === 10 ? true : false;
    }
    @computedFrom("roll1", "roll2", "roll3", "isLastFrame", "isStrike")
    public get showStrike3(): boolean {
        return ((this.isLastFrame && +this.roll3 === 10)
            || (!this.isLastFrame && this.isStrike)) ? true : false;
    }
    @computedFrom("isLastFrame", "isSpare", "isStrike")
    public get showSpare1(): boolean {
        return this.isLastFrame && this.isSpare && !this.isStrike ? true : false;
    }
    @computedFrom("isLastFrame", "isSpare", "isStrike")
    public get showSpare2(): boolean {
        return !this.isLastFrame && this.isSpare && !this.isStrike ? true : false;
    }

    // lifecycle
    public constructor(eventAggregator: EventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    // ui events
    private roll1Changed(newValue) {
        if (+this.roll1 === 10 && !this.isLastFrame) this.roll2 = 0;
        this.emitRollChangedEvent();
    }
    private roll2Changed(newValue) {
        this.emitRollChangedEvent();
    }
    private roll3Changed(newValue) {
        this.emitRollChangedEvent();
    }

    // public helpers
    public computeScore(previousFrameScore: number, sparePoints: number, strikePoints: number) {
        this.score = +previousFrameScore;
        if (this.isSpare) this.score += +sparePoints;
        if (this.isStrike) this.score += +strikePoints;
        this.score += this.getCombinedFrameRolls();
    }

    // private helpers
    private getCombinedFrameRolls() {
        if (this.isLastFrame) return +this.roll1 + +this.roll2 + +this.roll3;
        return +this.roll1 + +this.roll2;
    }

    private validate() {
        const regex: RegExp = new RegExp('^[0-9]+$');

        if ((this.roll1 && !regex.test(this.roll1?.toString()))
            || (this.roll2 && !regex.test(this.roll2?.toString()))
            || (this.roll3 && !regex.test(this.roll3?.toString()))
        ) {
            this.emitValidationError(`Please correct your rolls for ${this.name}. Please only input numbers.`)
        }
        else if (this.roll1 > 10 || this.roll2 > 10 || this.roll3 > 10) {
            this.emitValidationError(`Please correct your rolls for ${this.name}. No individual roll can be more than 10.`)
        }
        else if (!this.isLastFrame && +this.roll1 + +this.roll2 > 10) {
            this.emitValidationError(`Please correct your rolls for ${this.name}. Your rolls can't add to more than 10.`);
        }
        else if (this.isLastFrame && +this.roll1 !== 10 && +this.roll1 + +this.roll2 > 10) {
            this.emitValidationError(`Please correct your rolls for ${this.name}. Your first two rolls can't add to more than 10, unless roll 1 was a strike.`);
        }
        else if (this.isLastFrame && this.roll3 > 0 && +this.roll1 + +this.roll2 < 10) {
            this.emitValidationError(`Please correct your rolls for ${this.name}. You can't bowl a third roll unless you got a strike or a spare on this frame.`);
        }
        else {
            this.emitValidationClear();
        }
    }

    // emitter functions
    private emitRollChangedEvent() {
        this.validate();
        this.eventAggregator.publish(`${EventEnum.ROLL_CHANGED}_${this.scoreCardId}`, new RollChangeEventData({ indexOfFrame: this.index }));
    }

    private emitValidationError(errorMessage: string) {
        this.eventAggregator.publish(`${EventEnum.ROLL_VALIDATION_ERROR}_${this.scoreCardId}`, new RollValidationErrorEventData({ validationMessage: errorMessage }));
    }

    private emitValidationClear() {
        this.eventAggregator.publish(`${EventEnum.ROLL_VALIDATION_ERROR}_${this.scoreCardId}`, new RollValidationErrorEventData({ validationMessage: null }));
    }
}