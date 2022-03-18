import { bootstrap } from 'aurelia-bootstrapper';
import { ComponentTester, StageComponent } from 'aurelia-testing';
import { PLATFORM } from 'aurelia-pal';
import { PersonScoreCard } from 'resources/controls/person-score-card/person-score-card';
import * as assert from 'assert';
import { RollChangeEventData } from 'resources/entities/roll-change-event-data';
import { ScoreLoader } from "../helpers/score-loader"
import { FrameRolls } from '../entities/frame-rolls';

describe('PersonScoreCard', () => {
  let el: HTMLElement;
  let tester: ComponentTester;
  let sut: PersonScoreCard;

  beforeEach(async () => {
    tester = StageComponent
      .withResources("../../src/resources/controls/person-score-card/person-score-card")
      .inView(`<person-score-card></person-score-card>`);

    await tester.create(bootstrap)
    .then(() => {
      return tester.waitForElements("frame-card");
    });
    el = <HTMLElement>tester.element;
    sut = tester.viewModel;
  });

  it('test all strikes', async () => {
    sut.frameCards.forEach((frameCard, index) => {
      frameCard.roll1 = 10;
      if(frameCard.isLastFrame) {
        frameCard.roll2 = 10;
        frameCard.roll3 = 10;
      }
    });

    assert.strictEqual(sut.scoreTotal, 300);
  });

  it('test all 5s spares', async () => {
    sut.frameCards.forEach((frameCard, index) => {
      frameCard.roll1 = 5;
      frameCard.roll2 = 5;
      if(frameCard.isLastFrame) {
        frameCard.roll3 = 5;
      }
    });

    assert.strictEqual(sut.scoreTotal, 150);
  });

  it('test venminder example', async () => {
    const allFramesRolls = [
      new FrameRolls({roll1: 4, roll2: 3}),
      new FrameRolls({roll1: 7, roll2: 3}),
      new FrameRolls({roll1: 5, roll2: 2}),
      new FrameRolls({roll1: 8, roll2: 1}),
      new FrameRolls({roll1: 4, roll2: 6}),
      new FrameRolls({roll1: 2, roll2: 4}),
      new FrameRolls({roll1: 8, roll2: 0}),
      new FrameRolls({roll1: 8, roll2: 0}),
      new FrameRolls({roll1: 8, roll2: 2}),
      new FrameRolls({roll1: 10, roll2: 1, roll3: 7}),
    ];
    ScoreLoader(sut.frameCards, allFramesRolls);

    assert.strictEqual(sut.scoreTotal, 110);
  });

  it('test mix of strikes, spares, normals', async () => {
    const allFramesRolls = [
      new FrameRolls({roll1: 10, roll2: 0}),
      new FrameRolls({roll1: 5, roll2: 5}),
      new FrameRolls({roll1: 10, roll2: 0}),
      new FrameRolls({roll1: 10, roll2: 0}),
      new FrameRolls({roll1: 5, roll2: 5}),
      new FrameRolls({roll1: 5, roll2: 5}),
      new FrameRolls({roll1: 10, roll2: 0}),
      new FrameRolls({roll1: 0, roll2: 5}),
      new FrameRolls({roll1: 5, roll2: 0}),
      new FrameRolls({roll1: 5, roll2: 5, roll3: 9}),
    ];
    ScoreLoader(sut.frameCards, allFramesRolls);

    assert.strictEqual(sut.scoreTotal, 164);
  });
  
  // afterEach(() => tester.dispose());
});
