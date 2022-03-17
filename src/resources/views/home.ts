import { autoinject } from "aurelia-framework";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { EventEnum } from "resources/enums/event-enum";
import { FrameCardCustomElement } from "resources/controls/frame-card/frame-card";
import { RollChangeEventData } from "resources/entities/roll-change-event-data";

@autoinject
export class Home {
    // injected
    private eventAggregator: EventAggregator;

    // ui elements
    private frameCards: Array<FrameCardCustomElement> = new Array<FrameCardCustomElement>();

    // data
    private scoreTotal: number;
    private subscription: Subscription;

    // lifecycle
    private constructor(eventAggregator: EventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    private attached() {
        this.subscription = this.eventAggregator.subscribe(EventEnum.ROLL_CHANGED, this.rollChangeEventListener.bind(this));
    }

    private detached() {
        this.subscription.dispose();
    }

    // listeners
    private rollChangeEventListener(rollChangeEventData: RollChangeEventData) {
        const currentFrame: FrameCardCustomElement = this.frameCards[rollChangeEventData.indexOfFrame];

        // Compute previous frame
        const doublePreviousFrameScore = rollChangeEventData.indexOfFrame > 1 ? this.frameCards[+rollChangeEventData.indexOfFrame - 2].score : 0;
        if (rollChangeEventData.indexOfFrame > 0)
            this.frameCards[rollChangeEventData.indexOfFrame - 1].computeScore(doublePreviousFrameScore, currentFrame.roll1, currentFrame.roll2);

        // Compute current frame
        const previousFrameScore = rollChangeEventData.indexOfFrame > 0 ? this.frameCards[+rollChangeEventData.indexOfFrame - 1].score : 0;
        const nextFrameRoll1 = currentFrame.isLastFrame ? 0 : this.frameCards[+rollChangeEventData.indexOfFrame + 1].roll1;
        const nextFrameRoll2 = currentFrame.isLastFrame ? 0 : this.frameCards[+rollChangeEventData.indexOfFrame + 1].roll2;
        currentFrame.computeScore(previousFrameScore, nextFrameRoll1, nextFrameRoll2);

        // Update subsequent frames if scores exist
        if (!currentFrame.isLastFrame && this.frameCards[+rollChangeEventData.indexOfFrame + 1]?.score) {
            this.rollChangeEventListener(new RollChangeEventData({ indexOfFrame: +rollChangeEventData.indexOfFrame + 1 }));
        }

        // Update total
        if (currentFrame.isLastFrame && currentFrame.score) this.scoreTotal = currentFrame.score;
    }
}