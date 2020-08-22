import express from "express";
import dba from "server/dba.js"
const router = express.Router();


router.post("/musiquiz/create", async function (req, res) {

    const quizId = await dba.createQuiz(req.body);
    console.log("done saving ", quizId);
    res.send(quizId);
        
});

router.get("/musiquiz/list/:size", async function (req, res) {
    //todo error check
    const size = parseInt(req.params.size);

    const quizList = await dba.getQuizList(size);
    console.log("done fetching quiz list ", quizList);
    res.send(quizList);
        
});

router.get("/musiquiz/read/:id", async function (req, res) {
    const quiz = await dba.readQuizById(req.params.id);
    console.log("done reading quiz ", req.params.id);
    res.send(quiz);
});

router.get("/musiquiz/checkId/:id", async function (req, res) {
    const quiz = await dba.checkQuizById(req.params.id);
    console.log("done checking validity of QuizID ", req.params.id);
    res.send(quiz);
});

module.exports = router
