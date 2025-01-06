import {z} from 'zod'
import {OpenAPIRoute} from "chanfana";

export class AuthVerifyToken extends OpenAPIRoute {
    schema = {
        tags: ['Auth'],
        summary: 'Verify token',
        responses: {
            '200': {
                description: "Successful response",
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            user: z.object({
                                id: z.number(),
                                name: z.string(),
                                email: z.string().email(),
                                role: z.string(),
                                avatar: z.string(),
                            }),
                        }),
                    },
                },
            },
            "401": {
                description: "Not authenticated",
                schema: {
                    "success": false,
                    "errors": "Authentication error"
                },
            },
            '400': {
                description: "Error",
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            error: z.string()
                        }),
                    },
                },
            },
        },
    };

    async handle(c) {

        // Returning an object, automatically gets converted into a json response
        return {
            success: true,
            user: {
                id: c.get('user_id'),
                name: c.get('name'),
                email: c.get('email'),
                role: c.get('role'),
                avatar: c.get('avatar'),
            }
        }
    }
}
