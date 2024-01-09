const parseTime = (time: number): string => {
  const days = Math.floor(time / (24 * 60 * 60 * 1000));
  const daysms = time % (24 * 60 * 60 * 1000);
  const hours = Math.floor(daysms / (60 * 60 * 1000));
  const hoursms = daysms % (60 * 60 * 1000);
  const minutes = Math.floor(hoursms / (60 * 1000));
  const minutesms = hoursms % (60 * 1000);
  const sec = Math.floor(minutesms / 1000);

  const timeArray = [];
  if (days > 0) {
    timeArray.push(days + " Days");
  }
  if (hours > 0) {
    timeArray.push(hours + " Hours");
  }
  if (minutes > 0) {
    timeArray.push(minutes + " Minutes");
  }
  if (sec > 0 || time === 0) {
    timeArray.push(sec + " Seconds");
  }

  return timeArray.join(" ");
};

export default {
  parseTime,
};
