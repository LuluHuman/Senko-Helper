import { weekList } from "./types";
export const alp = "ABCDEFGHI".split("");

export class DateMs extends Date {
    getMidnightOffset() {
        const _h = this.getHours() * 60 * 60 * 1000;
        const _m = this.getMinutes() * 60 * 1000;
        const _s = this.getSeconds() * 1000;
        const midnightOffset = _h + _m + _s;
        return midnightOffset
    }
    toHourMinuteString(duration: number) {
        const midnight = this.getTime() - this.getMidnightOffset();
        const startDate = new Date(midnight + duration);
        return startDate.toLocaleString("en-US", { timeStyle: "short" }); // I just save myself 150 Bucks~
    }

}

export function getCurrentLsn(timeList: Array<string>, midOffset: number) {
    let curLessont24: any = -Infinity;
    timeList.forEach((lsnStartTime) => {
        const intTime = parseInt(lsnStartTime)
        const _beforeNow = midOffset < intTime;
        const _lastSavedisLess = curLessont24 < intTime;
        const _default = curLessont24 == -Infinity;
        if (_beforeNow && _lastSavedisLess && _default) curLessont24 = intTime
    });
    return curLessont24 == -Infinity ? null : curLessont24.toString();
}

export const defaultSettings = {
    class: {
        level: 4,
        class: 1,
    },
    Elec: {
        Sci: "Phy/Bio",
    },
}


export function locSubjInit(settings: typeof defaultSettings) {
    return (Subject: string | null | string[]) => {
        Subject = typeof Subject == "string" || Subject == null ? Subject : Subject[0];
        switch (Subject) {
            case "{SciElec}":
                return settings.Elec.Sci || Subject;
            default:
                return Subject;
        }
    }
}

export function ToDayStr(day: number) {
    const dayName = [
        { long: "Monday", short: "Mon" },
        { long: "Monday", short: "Mon" },
        { long: "Tuesday", short: "Tues" },
        { long: "Wednesday", short: "Wed" },
        { long: "Thursday", short: "Thurs" },
        { long: "Friday", short: "Fri" },
        { long: "Monday", short: "Mon" },
    ];
    const res = dayName[day] as { [key: string]: keyof weekList };
    return res
}
