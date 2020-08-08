import config from "server/config";
import { MongoClient, ObjectID } from "mongodb";

function getMongoClient() {
    return MongoClient.connect(config.dbConnStr, { useUnifiedTopology: true });
}

module.exports = {
    readQuizById: async (quizId) => {
        return getMongoClient().then((mongoClient, err) => {
            if (err) {
                throw err;
            }

            const quizCollection = mongoClient
                .db("musiquiz")
                .collection("quizes");
            return quizCollection
                .findOne(ObjectID(quizId))
                .then((r) => ({ quiz: r }));
        });
    },
    checkQuizById: async (quizId) => {
        return getMongoClient().then((mongoClient, err) => {
            if (err) {
                throw err;
            }

            const quizCollection = mongoClient
                .db("musiquiz")
                .collection("quizes");

            return quizCollection.findOne(ObjectID(quizId)).then((r) => {
                console.log("Checking validity of Quiz: ",typeof r, r);
                return { valid: r !== null };
            });
        });
    },
    getQuizList: async (size) => {
        return getMongoClient().then((mongoClient, err) => {
            if (err) {
                throw err;
            }

            const quizCollection = mongoClient
                .db("musiquiz")
                .collection("quizes");

            return quizCollection
                .find(
                    {},
                    {
                        limit: size,
                        sort: [["_id", -1]],
                        projection: { _id: 1, name: 1 },
                    }
                )
                .toArray()
                .then((r) => [...r]);
        });
    },
    createQuiz: async (quiz) => {
        return getMongoClient().then((mongoClient, err) => {
            if (err) {
                throw err;
            }

            const quizCollection = mongoClient
                .db("musiquiz")
                .collection("quizes");

            return quizCollection.insertOne(quiz).then((r) => ({
                quizId: r.insertedId,
            }));
        });
    },
};
