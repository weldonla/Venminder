import { autoinject, bindable } from "aurelia-framework";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { EventEnum } from "resources/enums/event-enum";
import { FrameCardCustomElement } from "resources/controls/frame-card/frame-card";
import { RollChangeEventData } from "resources/entities/roll-change-event-data";
import { RollValidationErrorEventData } from "resources/entities/roll-validation-error-event-data";

@autoinject
export class PersonScoreCard {
    // injected
    private eventAggregator: EventAggregator;

    // ui elements
    public frameCards: Array<FrameCardCustomElement> = new Array<FrameCardCustomElement>();

    // bindables
    @bindable id: number;
    @bindable deletePersonFunction: Function;

    // data
    private name: string;
    public scoreTotal: number;
    private subscriptions: Array<Subscription>;
    private validationMessage: string;

    // lifecycle
    public constructor(eventAggregator: EventAggregator) {
        this.eventAggregator = eventAggregator;
        this.subscriptions = new Array<Subscription>();
    }

    private attached() {
        this.subscriptions.push(this.eventAggregator.subscribe(`${EventEnum.ROLL_CHANGED}_${this.id}`, this.rollChangeEventListener.bind(this)));
        this.subscriptions.push(this.eventAggregator.subscribe(`${EventEnum.ROLL_VALIDATION_ERROR}_${this.id}`, this.validationMessageListener.bind(this)));
    }

    private detached() {
        this.subscriptions.forEach((subscription) => {
            subscription.dispose()
        });
    }

    // ui events
    private clearScoreCard() {
        this.frameCards.forEach((frameCard: FrameCardCustomElement) => {
            frameCard.roll1 = null;
            frameCard.roll2 = null;
            frameCard.roll3 = null;
            frameCard.score = null;
        });
        this.scoreTotal = null;
    }

    private rollRandom() {
        const indexOfFrameToUpdate: number = this.getNearestIncompleteFrameIndex();
        const frame: FrameCardCustomElement = this.frameCards[indexOfFrameToUpdate];

        if (!frame.roll1) frame.roll1 = this.getRandomInt(0, 10);
        else if (!frame.roll2) {
            frame.roll2 = this.getRandomInt(0, 10 - frame.roll1);
            if(frame.isLastFrame && !frame.isSpare) frame.roll3 = 0;
        }
        else if (frame.isLastFrame && !frame.roll3) frame.roll3 = this.getRandomInt(0, 10);
    }

    // listeners
    private rollChangeEventListener(rc: RollChangeEventData) {
        const currentFrame: FrameCardCustomElement = this.frameCards[rc.indexOfFrame];

        // Set index offset for updating previous 2 frames in case of spare or strikes
        // @todo potentially add additional if conditions to only set index offset if a spare or strike actually happened
        let indexOffset = 0;
        if (rc.indexOfFrame >= 1) indexOffset = 1;
        if (rc.indexOfFrame >= 2) indexOffset = 2;

        // Update all potentially relevant frames
        for (let i = +rc.indexOfFrame - indexOffset; i < this.frameCards.length; i++) {
            const frame = this.frameCards[i];

            // Prevent scores and scoreTotal from updating
            if(!frame.roll1 || !frame.roll2) break;

            this.updateFrame(frame);

            // Update total
            if (frame.isLastFrame) this.scoreTotal = frame.score;
        }
    }

    private validationMessageListener(rollValidationError: RollValidationErrorEventData) {
        this.validationMessage = rollValidationError.validationMessage;
    }

    // private helpers
    private updateFrame(frame: FrameCardCustomElement) {
        // @todo clean up / add helper methods
        const previousFrameScore = frame.index > 0 ? this.frameCards[+frame.index - 1].score : 0;

        let sparePoints = 0;
        let strikePoints = 0;
        if (!frame.isLastFrame) {
            const nextFrame = this.frameCards[+frame.index + 1];
            sparePoints = nextFrame.roll1;
            if (nextFrame.isStrike && !nextFrame.isLastFrame) {
                const nextNextFrame = this.frameCards[+frame.index + 2];
                strikePoints = nextNextFrame.roll1;
            }
            else {
                strikePoints = nextFrame.roll2;
            }
        }

        frame.computeScore(previousFrameScore, sparePoints, strikePoints);
    }

    private getNearestIncompleteFrameIndex(): number {
        // use for loop instead of foreach because we need to break at the first one found
        for(let i = 0; i < this.frameCards.length; i++) {
            let frameCard = this.frameCards[i];
            if (!frameCard.roll1 || !frameCard.roll2) {
                return +frameCard.index;
            }
        }

        return 9;
    }

    // copy and pasted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    private getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
    }
}