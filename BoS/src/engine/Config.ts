interface Dictionary {
    [index: string]: number;
}

const Config = {
    TickSpeeds: {
        Stopped: -1,
        Normal: 1000
    } as Dictionary
}

export {
    Config
}