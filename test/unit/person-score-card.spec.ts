import { bootstrap } from 'aurelia-bootstrapper';
import { ComponentTester, StageComponent } from 'aurelia-testing';
import { FrameRolls } from '../entities/frame-rolls';
import { PersonScoreCard } from 'resources/controls/person-score-card/person-score-card';
import { ScoreLoader } from "../helpers/score-loader"
import * as assert from 'assert';

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

  it('test all gutter balls', async () => {
    sut.frameCards.forEach((frameCard) => {
      frameCard.roll1 = 0;
      frameCard.roll2 = 0;
      if (frameCard.isLastFrame) {
        frameCard.roll3 = 0;
      }
    });

    await tester.waitForElement("#scoreTotal")

    assert.strictEqual(sut.scoreTotal, 0);
  });

  it('test all strikes', async () => {
    sut.frameCards.forEach((frameCard) => {
      frameCard.roll1 = 10;
      if (frameCard.isLastFrame) {
        frameCard.roll2 = 10;
        frameCard.roll3 = 10;
      }
    });

    await tester.waitForElement("#scoreTotal")

    assert.strictEqual(sut.scoreTotal, 300);
  });

  it('test all 5s spares', async () => {
    sut.frameCards.forEach((frameCard) => {
      frameCard.roll1 = 5;
      frameCard.roll2 = 5;
      if (frameCard.isLastFrame) {
        frameCard.roll3 = 5;
      }
    });
    
    await tester.waitForElement("#scoreTotal")

    assert.strictEqual(sut.scoreTotal, 150);
  });

  it('test venminder example', async () => {
    const allRolls = [
      new FrameRolls({ roll1: 4, roll2: 3 }),
      new FrameRolls({ roll1: 7, roll2: 3 }),
      new FrameRolls({ roll1: 5, roll2: 2 }),
      new FrameRolls({ roll1: 8, roll2: 1 }),
      new FrameRolls({ roll1: 4, roll2: 6 }),
      new FrameRolls({ roll1: 2, roll2: 4 }),
      new FrameRolls({ roll1: 8, roll2: 0 }),
      new FrameRolls({ roll1: 8, roll2: 0 }),
      new FrameRolls({ roll1: 8, roll2: 2 }),
      new FrameRolls({ roll1: 10, roll2: 1, roll3: 7 }),
    ];
    ScoreLoader(sut.frameCards, allRolls);
    
    await tester.waitForElement("#scoreTotal")

    assert.strictEqual(sut.scoreTotal, 110);
  });

  it('test mix of strikes, spares, normals 1', async () => {
    const allRolls = [
      new FrameRolls({ roll1: 10, roll2: 0 }),
      new FrameRolls({ roll1: 5, roll2: 5 }),
      new FrameRolls({ roll1: 10, roll2: 0 }),
      new FrameRolls({ roll1: 10, roll2: 0 }),
      new FrameRolls({ roll1: 5, roll2: 5 }),
      new FrameRolls({ roll1: 5, roll2: 5 }),
      new FrameRolls({ roll1: 10, roll2: 0 }),
      new FrameRolls({ roll1: 0, roll2: 5 }),
      new FrameRolls({ roll1: 5, roll2: 0 }),
      new FrameRolls({ roll1: 5, roll2: 5, roll3: 9 }),
    ];
    ScoreLoader(sut.frameCards, allRolls);
    
    await tester.waitForElement("#scoreTotal")

    assert.strictEqual(sut.scoreTotal, 164);
  });

  it('test mix of strikes, spares, normals 2', async () => {
    const allRolls = [
      new FrameRolls({ roll1: 10, roll2: 0 }),
      new FrameRolls({ roll1: 9, roll2: 1 }),
      new FrameRolls({ roll1: 1, roll2: 9 }),
      new FrameRolls({ roll1: 10, roll2: 0 }),
      new FrameRolls({ roll1: 10, roll2: 0 }),
      new FrameRolls({ roll1: 5, roll2: 5 }),
      new FrameRolls({ roll1: 0, roll2: 6 }),
      new FrameRolls({ roll1: 7, roll2: 2 }),
      new FrameRolls({ roll1: 6, roll2: 2 }),
      new FrameRolls({ roll1: 9, roll2: 1, roll3: 1 }),
    ];
    ScoreLoader(sut.frameCards, allRolls);
    
    await tester.waitForElement("#scoreTotal")

    assert.strictEqual(sut.scoreTotal, 140);
  });

  // afterEach(() => tester.dispose());
});
