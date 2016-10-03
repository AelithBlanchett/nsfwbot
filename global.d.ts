export {}

declare module global {
    interface String {
        calcWidth(): number;
    }
}