import { autoinject } from "aurelia-framework";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { EventEnum } from "resources/enums/event-enum";
import { FrameCardCustomElement } from "resources/controls/frame-card/frame-card";
import { RollChangeEventData } from "resources/entities/roll-change-event-data";
import { RollValidationErrorEventData } from "resources/entities/roll-validation-error-event-data";

@autoinject
export class Home {
    // injected
    private eventAggregator: EventAggregator;

    // ui elements
    private frameCards: Array<FrameCardCustomElement> = new Array<FrameCardCustomElement>();

    // data
    private scoreTotal: number;
    private subscriptions: Array<Subscription>;
    private validationMessage: string;

    // lifecycle
    private constructor(eventAggregator: EventAggregator) {
        this.eventAggregator = eventAggregator;
        this.subscriptions = new Array<Subscription>();
    }

    private attached() {
        this.subscriptions.push(this.eventAggregator.subscribe(EventEnum.ROLL_CHANGED, this.rollChangeEventListener.bind(this)));
        this.subscriptions.push(this.eventAggregator.subscribe(EventEnum.ROLL_VALIDATION_ERROR, this.validationMessageListener.bind(this)));
    }

    private detached() {
        this.subscriptions.forEach((subscription) => {
            subscription.dispose()
        });
    }

    // listeners
    private rollChangeEventListener(rc: RollChangeEventData) {
        const currentFrame: FrameCardCustomElement = this.frameCards[rc.indexOfFrame];

        // Compute double previous frame
        const triplePreviousFrameScore = rc.indexOfFrame > 2 ? this.frameCards[+rc.indexOfFrame - 3].score : 0;
        if (rc.indexOfFrame > 1) {
            const add1 = this.frameCards[+rc.indexOfFrame - 1].roll1;
            const add2 = this.frameCards[+rc.indexOfFrame - 1].isStrike ? currentFrame.roll1 : this.frameCards[+rc.indexOfFrame - 1].roll2;
            this.frameCards[rc.indexOfFrame - 2].computeScore(triplePreviousFrameScore, add1, add2);
        }

        // Compute previous frame
        const doublePreviousFrameScore = rc.indexOfFrame > 1 ? this.frameCards[+rc.indexOfFrame - 2].score : 0;
        if (rc.indexOfFrame > 0) {
            const add1 = currentFrame.roll1;
            const add2 = this.frameCards[+rc.indexOfFrame - 1].isStrike && !currentFrame.isLastFrame ? this.frameCards[+rc.indexOfFrame + 1].roll1 : currentFrame.roll2;
            this.frameCards[rc.indexOfFrame - 1].computeScore(doublePreviousFrameScore, add1, add2);
        }

        // Compute current frame
        const previousFrameScore = rc.indexOfFrame > 0 ? this.frameCards[+rc.indexOfFrame - 1].score : 0;
        const nextFrameRoll1 = currentFrame.isLastFrame ? 0 : this.frameCards[+rc.indexOfFrame + 1].roll1;
        const nextFrameRoll2 = currentFrame.isLastFrame ? 0
            : this.frameCards[+rc.indexOfFrame + 1].isStrike && !this.frameCards[+rc.indexOfFrame + 1].isLastFrame
                ? this.frameCards[+rc.indexOfFrame + 2].roll1
                : this.frameCards[+rc.indexOfFrame + 1].roll1;
        currentFrame.computeScore(previousFrameScore, nextFrameRoll1, nextFrameRoll2);

        // Update subsequent frames if scores exist
        if (!currentFrame.isLastFrame && this.frameCards[+rc.indexOfFrame + 1]?.score) {
            this.rollChangeEventListener(new RollChangeEventData({ indexOfFrame: +rc.indexOfFrame + 1 }));
        }

        // Update total
        if (currentFrame.isLastFrame && currentFrame.score) this.scoreTotal = currentFrame.score;
    }

    private validationMessageListener(rollValidationError: RollValidationErrorEventData) {
        this.validationMessage = rollValidationError.validationMessage;
    }

    // private helpers
    private getRollAdd(numberOfRoll: number) {


    }
}