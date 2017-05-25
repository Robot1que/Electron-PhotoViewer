export class Time {
    public static delay(ms: number): Promise<void> {
        return new Promise<void>((resolve, _reject) => {
            setTimeout(() => resolve(), ms);
        });
    }
}