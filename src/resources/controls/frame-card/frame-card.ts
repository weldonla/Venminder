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
    @bindable private index: number;
    @bindable private title: string;
    @bindable public isLastFrame: boolean;

    // observables
    @observable public roll1: number;
    @observable public roll2: number;
    @observable public roll3: number;

    // data
    public score: number;

    // computed props
    @computedFrom("roll1", "roll2")
    private get isStrike(): boolean {
        if (!this.roll1 || !this.roll2) return false;
        return +this.roll1 === 10 ? true : false;
    }
    @computedFrom("roll1", "roll2")
    private get isSpare(): boolean {
        if (!this.roll1 || !this.roll2) return false;
        return (+this.roll1 + +this.roll2 === 10) ? true : false;
    }

    // lifecycle
    private constructor(eventAggregator: EventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    // ui events
    private roll1Changed() {
        this.emitRollChangedEvent();
    }
    private roll2Changed() {
        this.emitRollChangedEvent();
    }
    private roll3Changed() {
        this.emitRollChangedEvent();
    }

    // public helpers
    computeScore(previousFrameScore: number, nextFrameRoll1: number, nextFrameRoll2: number) {
        this.score = +previousFrameScore;
        if (this.isSpare) this.score += +nextFrameRoll1;
        if (this.isStrike) this.score += +nextFrameRoll2;
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
        this.emitValidationClear();
        if(this.roll1 > 10 || this.roll2 > 10 || this.roll3 > 10) {
            this.emitValidationError(`Please correct your score for ${this.title}. No individual roll can be more than 10.`)
        }
        else if(!this.isLastFrame && +this.roll1 + +this.roll2 > 10) {
            this.emitValidationError(`Please correct your score for ${this.title}. You're rolls can't add to more than 10.`);
        }
        else if(this.isLastFrame && this.roll3 && +this.roll1 + +this.roll2 !== 10) {
            this.emitValidationError(`Please correct your score for ${this.title}. You can't bowl a third roll unless you got a strike or a spare on this frame.`);
        }
    }

    private emitValidationError(errorMessage: string) {
        this.eventAggregator.publish(EventEnum.ROLL_VALIDATION_ERROR, new RollValidationErrorEventData({ validationMessage: errorMessage }));
    }

    private emitValidationClear() {
        this.eventAggregator.publish(EventEnum.ROLL_VALIDATION_ERROR, new RollValidationErrorEventData({ validationMessage: null }));
    }
}