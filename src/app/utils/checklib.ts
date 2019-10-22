export class Checklib {
    static isBlank(str): boolean {
        return (!str || /^\s*$/.test(str));
    }
}
