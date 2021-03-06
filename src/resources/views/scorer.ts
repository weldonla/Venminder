export class Scorer {
    // data
    personScoreCards: Array<number>

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

        if (this.personScoreCards.length === 0) return 0;

        this.personScoreCards.forEach((id) => {
            if (id >= highestExistingId) {
                highestExistingId = id;
            }
        });

        return highestExistingId + 1;
    }
}