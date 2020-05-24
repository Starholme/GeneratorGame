import { Dictionary, Resource } from './Interfaces';

const Config = {
    TickSpeeds: {
        Stopped: -1,
        Normal: 1000
    } as Dictionary,
    Resources: {
        Oil: {
            name: 'Oil',
            unit: 'L'
        } as Resource
    }
}

export {
    Config
}