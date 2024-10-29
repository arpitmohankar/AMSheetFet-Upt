class SheetStore {
    private currentSheetId: string | null;

    constructor() {
        this.currentSheetId = null;
    }

    setSheetId(id: string): void {
        if (!id) {
            throw new Error('Sheet ID cannot be empty');
        }
        this.currentSheetId = id;
    }

    getSheetId(): string {
        if (!this.currentSheetId) {
            throw new Error('Sheet ID not set');
        }
        return this.currentSheetId;
    }

    hasSheetId(): boolean {
        return this.currentSheetId !== null;
    }
}

export default new SheetStore();