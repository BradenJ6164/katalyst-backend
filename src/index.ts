import {GetSearch} from "./endpoints/search";

import {Hono} from "hono";
import {cors} from "hono/cors"
import {fromHono} from "chanfana";
import {Env} from "./types";

import {authenticateUser} from "./utils/auth";

import {GetGuides} from "./endpoints/property/guides/getGuides";
import {DeleteGuide} from "./endpoints/property/guides/deleteGuide";
import {CreateGuide} from "./endpoints/property/guides/createGuide";
import {GetGuide} from "./endpoints/property/guides/getGuide";
import {GetProperty} from "./endpoints/property/getProperty";
import {SetGuide} from "./endpoints/property/guides/setGuide";
import {SetProperty} from "./endpoints/property/setProperty";
import {GetProperties} from "./endpoints/property/getProperties";
import {GetCurrentReservation} from "./endpoints/reservation/getCurrentReservation";
import {AuthLogin} from "./endpoints/auth/authLogin";
import {AuthVerifyToken} from "./endpoints/auth/authVerifyToken";
import {AuthLogout} from "./endpoints/auth/authLogout";
import {SetUser} from "./endpoints/auth/setUser";
import {AuthRegister} from "./endpoints/auth/authRegister";
import {SubscribeProperty} from "./endpoints/auth/subscribeProperty";


// Start a Hono app
const app = new Hono<{ Bindings: Env }>()
app.use('/api/*', cors())

// Setup OpenAPI registry
const openapi = fromHono(app, {
    schema: {
        info: {
            title: "Katalyst Backend",
            version: '1.0',
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    docs_url: "/docs",
})
openapi.registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
})

// 1. Endpoints that don't require Auth
openapi.post('/api/auth/register', AuthRegister);
openapi.post('/api/auth/login', AuthLogin);
openapi.get('/api/reservations/getCurrentReservation', GetCurrentReservation)
openapi.get('/api/guides/getGuide', GetGuide)
openapi.get('/api/properties/getProperty', GetProperty)
// 2. Authentication middleware
openapi.use('/api/*', authenticateUser)


// 3. Endpoints that require Auth
openapi.post('/api/auth/verifyToken', AuthVerifyToken);
openapi.post('/api/auth/logout', AuthLogout);
openapi.get("/api/search", GetSearch);
openapi.post('/api/guides/setGuide', SetGuide)
openapi.post('/api/guides/createGuide', CreateGuide)
openapi.post('/api/guides/deleteGuide', DeleteGuide)
openapi.get('/api/guides/getGuides', GetGuides)
openapi.post('/api/users/setUser', SetUser)
openapi.post('/api/users/subscribeProperty', SubscribeProperty)
openapi.post('/api/properties/setProperty', SetProperty)
openapi.get('/api/properties/getProperties', GetProperties)
// 404 for everything else
openapi.all("*", () => new Response("Not Found.", {status: 404}));

// Export the Hono app
export default app