import MQDoor from "components/MQDoor";
import MQMenu from "components/MQMenu";
import MQPlay from "components/MQPlay";
import MQCreate from "components/MQCreate";


export const clientRoutes = [
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
        component:MQPlay,
        fetchInitialData:async ()=>{}
    },
]
