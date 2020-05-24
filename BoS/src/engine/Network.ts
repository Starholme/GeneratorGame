import { Box, Levels, Resource } from './Interfaces'

interface Lvl {
    current: number;
    max: number;
    diff: number;
    mult: number;
}

export class Network {
    private name: string;
    private resource: Resource;
    private boxes: Array<Box>;

    constructor(name: string, resource: Resource) {
        this.name = name
        this.resource = resource;
        this.boxes = new Array<Box>();
    }

    public AddBox(box: Box) {
        this.boxes.push(box);
        this.Sort();
    }

    public RemoveBox(box: Box): boolean {
        const index = this.boxes.indexOf(box);
        if (index > -1) {
            this.boxes.splice(index, 1);
            return true;
        }
        return false;
    }

    public Update() {
        const levels = new Array<Lvl>();
        levels[Levels.Low] =
        {
            current: 0,
            max: 0,
            diff: 0,
            mult: 0
        };
        levels[Levels.Storage] =
        {
            current: 0,
            max: 0,
            diff: 0,
            mult: 0
        };
        levels[Levels.High] =
        {
            current: 0,
            max: 0,
            diff: 0,
            mult: 0
        };

        //Get current and used for each level
        this.boxes.forEach(function (box) {
            levels[box.level].current += box.current;
            levels[box.level].max += box.max;
        });

        //Starting from lowest level, attempt to fill from higher levels
        levels.forEach((toLevel: Lvl, toIdx: number) => {
            levels.forEach((fromLevel: Lvl, fromIdx: number) => {
                if (toIdx < fromIdx) {
                    this.PullFromTo(fromLevel, toLevel);
                }
            });
            toLevel.mult = toLevel.max / toLevel.current;
        });

        //Spread the current amount for each level across boxes of that level
        let extra = 0;
        this.boxes.forEach((box) => {
            const mult = levels[box.level].mult;
            extra = this.FillInt(box, extra, mult);
        });
    }

    private PullFromTo(from: Lvl, to: Lvl) {
        to.diff = to.max - to.current;
        if (to.diff > 0) {
            //If enough in from, fill to
            if (from.current >= to.diff) {
                to.current += to.diff;
                from.current -= to.diff;
            }
            //Otherwise, take what is available
            else {
                to.current += from.current;
                from.current = 0;
            }
        }
    }

    private FillInt(box: Box, extra: number, mult: number): number {
        let current = mult * box.max;
        extra += current % 1;
        current = Math.floor(current);
        if (Math.round(extra) === 1) {
            extra--;
            current++;
        }
        box.current = current;
        return extra;
    }

    private Sort() {
        this.boxes.sort(function (a: Box, b: Box): number {
            return a.level - b.level;
        })
    }
}