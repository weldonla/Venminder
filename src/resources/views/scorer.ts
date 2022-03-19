export class Scorer {
    // data
    personScoreCards: Array<number>

    // ui
    personScoreCardsHolder: HTMLElement;

    private attached() {
        this.personScoreCards = new Array<number>();
        this.addNewPersonScoreCard();
    }

    // ui events
    addNewPersonScoreCard() {
        this.personScoreCards.push(this.getNewPersonScoreCardId());
    }

    deletePersonScoreCardById(idToDelete: number) {
        this.personScoreCards = this.personScoreCards.filter((id: number) => id !== idToDelete);
    }

    // private helpers
    private getNewPersonScoreCardId(): number {
        let highestExistingId: number = 0;

        if(this.personScoreCards.length === 0) return 0;

        for(let id of this.personScoreCards) {
            if(id >= highestExistingId) {
                highestExistingId = id;
            }
        }

        return highestExistingId + 1;
    }
}