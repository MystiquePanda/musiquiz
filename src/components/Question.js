const levels = ["track", "artist", "album"];

const Question = {
    matchLevels: levels,
    template: {
        id: 0,
        question: "",
        answer: {},
        level: levels.slice(0, 2)
    },
};

export default Question;
