import config from "server/config";
import { MongoClient, ObjectID } from "mongodb";

module.exports = {
    readQuizById: async (quizId) => {
        return MongoClient.connect(config.dbConnStr).then(
            (mongoClient, err) => {
                if (err) {
                    throw err;
                }

                const quizCollection = mongoClient
                    .db("musiquiz")
                    .collection("quizes");
                return quizCollection
                    .findOne(ObjectID(quizId))
                    .then((r) => ({ quiz: r }));
            }
        );
    },
    createQuiz: async (quiz) => {
        return MongoClient.connect(config.dbConnStr).then(
            (mongoClient, err) => {
                if (err) {
                    throw err;
                }

                const quizCollection = mongoClient
                    .db("musiquiz")
                    .collection("quizes");

                return quizCollection.insertOne(quiz).then((r) => ({
                    quizId: r.insertedId,
                }));
            }
        );
    },
};
