const lessThanMinute = (minute) => {
    return (currentTimeStamp,index,timeStamps) => {
        if (index == 0) return true;
        const dateCurrentTime = new Date(currentTimeStamp);
        const datePreviousTime = new Date(timeStamps[index-1]);
        return dateCurrentTime.getMinutes() - datePreviousTime.getMinutes() <= minute;
    }
}

const lessThan3Minute = lessThanMinute(3);

const isSpam = (timeStamps) => {
    if (timeStamps.length < 10) return false;
    return timeStamps.every(lessThan3Minute);
}

exports.isSpam = isSpam;