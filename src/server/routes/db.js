import express from "express";
import dba from "server/dba.js"
const router = express.Router();
const request = require("request");



router.post("/musiquiz/create", async function (req, res) {

    const quizId = await dba.createQuiz(req.body);
    console.log("done saving ", quizId);
    res.send(quizId);
        
});

router.post("/musiquiz/read/:id", async function (req, res) {
    const quiz = await dba.readQuizById();
    console.log("done saving ", req.params.id);
    res.send(quiz);
});

module.exports = router
