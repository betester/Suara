exports.findMissingElement = (setOne, setTwo) => {
    if (setOne.size > setTwo.size) {
        let tmp = setTwo;
        setTwo = setOne;
        setOne = tmp;
    }
  for (const element of setTwo) {
    if (!setOne.has(element)) {
      return element;
    }
  }
};
