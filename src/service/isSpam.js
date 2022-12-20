const lessThanMinute = (minute) => {
    return (currentTimeStamp,index,timeStamps) => {
        if (index == 0) return true;
        const dateCurrentTime = new Date(currentTimeStamp);
        const datePreviousTime = new Date(timeStamps[index-1]);
        return dateCurrentTime.getMinutes() - datePreviousTime.getMinutes() <= minute;
    }
}

const lessThan1Minute = lessThanMinute(1);

const isSpam = (timeStamps) => {
    if (timeStamps.length <= 5) return false;
    return timeStamps.every(lessThan1Minute);
}

exports.isSpam = isSpam;