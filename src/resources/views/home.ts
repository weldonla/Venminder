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

        // Compute/update two previous frames if they exist and current frame
        if (rc.indexOfFrame > 1) this.updateFrame(this.frameCards[rc.indexOfFrame - 2]);
        if (rc.indexOfFrame > 0) this.updateFrame(this.frameCards[rc.indexOfFrame - 1]);
        this.updateFrame(currentFrame);

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
    private updateFrame(frame: FrameCardCustomElement) {
        const previousFrameScore = frame.index > 0 ? this.frameCards[+frame.index - 1].score : 0;

        let add1 = 0;
        let add2 = 0;
        if(!frame.isLastFrame) {
            const nextFrame = this.frameCards[+frame.index + 1];
            add1 = nextFrame.roll1;
            if(nextFrame.isStrike && !nextFrame.isLastFrame) {
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