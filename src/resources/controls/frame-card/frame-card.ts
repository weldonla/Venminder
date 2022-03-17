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
        return (+this.roll1 + +this.roll2 === 10) ? true : false;
    }

    // lifecycle
    private constructor(eventAggregator: EventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    // ui events
    private roll1Changed() {
        if(+this.roll1 === 10 && !this.isLastFrame) this.roll2 = 0;
        this.emitRollChangedEvent();
    }
    private roll2Changed() {
        this.emitRollChangedEvent();
    }
    private roll3Changed() {
        this.emitRollChangedEvent();
    }

    // public helpers
    public computeScore(previousFrameScore: number, add1: number, add2: number) {
        this.score = +previousFrameScore;
        if (this.isSpare) this.score += +add1;
        if (this.isStrike) this.score += +add2;
        this.score += this.getCombinedFrameRolls();
    }

    // private helpers
    private getCombinedFrameRolls() {
        if (this.isLastFrame) return +this.roll1 + +this.roll2 + +this.roll3;
        return +this.roll1 + +this.roll2;
    }

    private emitRollChangedEvent() {
        this.validate();
        this.eventAggregator.publish(EventEnum.ROLL_CHANGED, new RollChangeEventData({ indexOfFrame: this.index }));
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
            this.emitValidationError(`Please correct your score for ${this.name}. No individual roll can be more than 10.`)
        }
        else if (!this.isLastFrame && +this.roll1 + +this.roll2 > 10) {
            this.emitValidationError(`Please correct your score for ${this.name}. You're rolls can't add to more than 10.`);
        }
        else if (this.isLastFrame && this.roll3 > 0 && +this.roll1 + +this.roll2 < 10) {
            this.emitValidationError(`Please correct your score for ${this.name}. You can't bowl a third roll unless you got a strike or a spare on this frame.`);
        }
        else {
            this.emitValidationClear();
        }
    }

    private emitValidationError(errorMessage: string) {
        this.eventAggregator.publish(EventEnum.ROLL_VALIDATION_ERROR, new RollValidationErrorEventData({ validationMessage: errorMessage }));
    }

    private emitValidationClear() {
        this.eventAggregator.publish(EventEnum.ROLL_VALIDATION_ERROR, new RollValidationErrorEventData({ validationMessage: null }));
    }
}