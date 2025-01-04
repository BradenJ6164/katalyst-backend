import {GetSearch} from "./endpoints/search";

import {Hono} from "hono";
import {cors} from "hono/cors"
import {fromHono} from "chanfana";
import {Env} from "./types";
import {AuthRegister} from "./endpoints/authRegister";
import {AuthLogin} from "./endpoints/authLogin";
import {authenticateUser} from "./utils/auth";
import {GetCurrentReservation} from "./endpoints/getCurrentReservation";

// Cors Headers

export const corsHeaders = {
	'Access-Control-Allow-Headers': '*', // What headers are allowed. * is wildcard. Instead of using '*', you can specify a list of specific headers that are allowed, such as: Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization.
	'Access-Control-Allow-Methods': 'POST', // Allowed methods. Others could be GET, PUT, DELETE etc.
	'Access-Control-Allow-Origin': '*', // This is URLs that are allowed to access the server. * is the wildcard character meaning any URL can.
}

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

openapi.get('/api/reservations/getCurrentReservation',GetCurrentReservation)


// 2. Authentication middleware
openapi.use('/api/*', authenticateUser)


// 3. Endpoints that require Auth
openapi.get("/api/search", GetSearch);


// 404 for everything else
openapi.all("*", () => new Response("Not Found.", {status: 404}));

// Export the Hono app
export default app