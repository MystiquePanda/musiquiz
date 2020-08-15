import MQDoor from "components/MQDoor";
import MQMenu from "components/MQMenu";
import MQPlay from "components/MQPlay";
import MQCreate from "components/MQCreate";
import dba from "server/dba";

export const serverRoutes = [
    { path: "/door", exact: true, component: MQDoor },
    { path: "/", isProtected: true, exact: true, component: MQMenu },
    { path: "/play", isProtected: true, exact: true, component: MQPlay },
    { path: "/spotify/current_play", isProtected: true, exact: true },
    {
        path: "/create",
        isProtected: true,
        exact: true,
        modal: true,
        component: MQCreate,
    },
    {
        path: "/play/:id",
        isProtected: true,
        exact: true,
        component: MQPlay,
        fetchInitialData: async (path = "") => {
            const quizId = path.split("/").pop();
            console.log("before rending play page, fetching ", quizId);

            return dba.readQuizById(quizId);
            //return {}
        },
    },
];
