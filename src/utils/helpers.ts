
export const percent = (total: number, current: number) => {
    return Math.round((current / total) * 100);
};

export const formattedDate = (date: string) => {
    const dateObject = new Date(date);
    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export function formatMillisecondsToTime(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let formattedTime = '';

    if (days > 0) {
        formattedTime += `${days}d `;
    }

    if (hours > 0 || (days === 0 && minutes === 0)) {
        formattedTime += `${hours}h `;
    }

    if (minutes > 0 || (days === 0 && hours === 0)) {
        formattedTime += `${minutes}m `;
    }

    return formattedTime.trim();
};

export function formatSecondsToTime(sec: number): string {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;

    const parts: string[] = [];

    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0 || hours > 0) {
        parts.push(`${minutes}min`);
    }

    if (seconds > 0 || (hours === 0 && minutes === 0)) {
        parts.push(`${seconds}s`);
    }

    return parts.join(' ');
};

export  function formatBytes(b: number) {
    const gb = b / (1024 ** 3);

    return gb.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: gb % 1 === 0 ? 0 : 2,
    });
};

export  function formatMB(mb: number) {
    const gb = mb / (1024);

    return gb.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: gb % 1 === 0 ? 0 : 1,
    });
};

export const sortedByAlphabet = (value: any, item?: any) => {

    if (Array.isArray(value)) {
        return (value || []).sort((a, b) => {

            if (!a || !b) {
                return -1
            }

            return a[item] < b[item]
                ? -1
                : a[item] > b[item] ? 1 : 0
        });
    };

    return Object.keys(value).sort().reduce((acc: any, key) => {
        acc[key] = value[key];
        return acc;
    }, {});

    
};

export function urlParam(name: string, url?: string): string | null {
    const results: RegExpExecArray | null = new RegExp('[?&]' + name + '=([^&#]*)').exec(url || window.location.href);
    if (results && results.length > 0) {
        return decodeURIComponent(results[1]);
    }
    return null;
};


export const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-US').format(number);
};