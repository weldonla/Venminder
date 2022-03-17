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
    private rollChangeEventListener(rollChange: RollChangeEventData) {
        const currentFrame: FrameCardCustomElement = this.frameCards[rollChange.indexOfFrame];

        // Compute previous frame
        const doublePreviousFrameScore = rollChange.indexOfFrame > 1 ? this.frameCards[+rollChange.indexOfFrame - 2].score : 0;
        if (rollChange.indexOfFrame > 0)
            this.frameCards[rollChange.indexOfFrame - 1].computeScore(doublePreviousFrameScore, currentFrame.roll1, currentFrame.roll2);

        // Compute current frame
        const previousFrameScore = rollChange.indexOfFrame > 0 ? this.frameCards[+rollChange.indexOfFrame - 1].score : 0;
        const nextFrameRoll1 = currentFrame.isLastFrame ? 0 : this.frameCards[+rollChange.indexOfFrame + 1].roll1;
        const nextFrameRoll2 = currentFrame.isLastFrame ? 0 : this.frameCards[+rollChange.indexOfFrame + 1].roll2;
        currentFrame.computeScore(previousFrameScore, nextFrameRoll1, nextFrameRoll2);

        // Update subsequent frames if scores exist
        if (!currentFrame.isLastFrame && this.frameCards[+rollChange.indexOfFrame + 1]?.score) {
            this.rollChangeEventListener(new RollChangeEventData({ indexOfFrame: +rollChange.indexOfFrame + 1 }));
        }

        // Update total
        if (currentFrame.isLastFrame && currentFrame.score) this.scoreTotal = currentFrame.score;
    }

    private validationMessageListener(rollValidationError: RollValidationErrorEventData) {
        this.validationMessage = rollValidationError.validationMessage;
    }
}