class Utils {
    static MinInArray(arr: Array<Number>) {
        return Math.min.apply(Math, arr);
    }
    static MaxInArray(arr: Array<Number>) {
        return Math.max.apply(Math, arr);
    }

    static pad(width, string, padding) {
        return (width <= string.length) ? string : Utils.pad(width, padding + string, padding)
    }

}