import { autoinject } from "aurelia-framework";
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

    // data
    private name: string;
    public scoreTotal: number;
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

        // Set index offset for updating previous 2 frames in case of spare or strikes
        // @todo you can potentially add additional if conditions to only set index offset if a spare or strike happened
        let indexOffset = 0;
        if (rc.indexOfFrame >= 1) indexOffset = 1;
        if (rc.indexOfFrame >= 2) indexOffset = 2;

        // Update current frame and update subsequent frames if scores exist
        // @todo potentially implement break to only update scores if a score has been calculated before for that frame
        for (let i = +rc.indexOfFrame - indexOffset; i < this.frameCards.length; i++) {
            const frame = this.frameCards[i];

            // if (!frame.roll1 || !frame.roll2) break;

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
        const previousFrameScore = frame.index > 0 ? this.frameCards[+frame.index - 1].score : 0;

        let add1 = 0;
        let add2 = 0;
        if (!frame.isLastFrame) {
            const nextFrame = this.frameCards[+frame.index + 1];
            add1 = nextFrame.roll1;
            if (nextFrame.isStrike && !nextFrame.isLastFrame) {
                const nextNextFrame = this.frameCards[+frame.index + 2];
                add2 = nextNextFrame.roll1;
            }
            else {
                add2 = nextFrame.roll2;
            }
        }

        frame.computeScore(previousFrameScore, add1, add2);
    }
}