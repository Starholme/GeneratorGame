interface Dictionary {
    [index: string]: number;
}

interface Box {
    current: number;
    max: number;
    level: Levels;
}

enum Levels {
    High = 10,
    Storage = 0,
    Low = -10
}

interface Resource {
    name: string;
    unit: string;
}

export {
    Dictionary,
    Box,
    Levels,
    Resource
}