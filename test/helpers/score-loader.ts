import { FrameCardCustomElement } from "resources/controls/frame-card/frame-card";
import { FrameRolls } from "../entities/frame-rolls";

export function ScoreLoader(frameCards: Array<FrameCardCustomElement>, frameRolls: Array<FrameRolls>) {
        frameCards.map((frameCard) => {
            frameCard.roll1 = frameRolls[frameCard.index].roll1;
            frameCard.roll2 = frameRolls[frameCard.index].roll2;
            frameCard.roll3 = frameRolls[frameCard.index].roll3;
        });
}