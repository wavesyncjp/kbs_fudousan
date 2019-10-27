export class Dialog {
    title: string;
    message: string;
    choose: boolean;
    public constructor(init?: Partial<Dialog>) {
        Object.assign(this, init);
    }
}
