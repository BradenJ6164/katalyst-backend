import {z} from 'zod'
import {Ip, OpenAPIRoute} from "chanfana";
import {D1QB} from "workers-qb";
import {User, UserSession} from "../types";
import {hashPassword} from "../utils/hash";
import requestIp from "request-ip"

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
                            success: z.boolean()
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
        }
    }
}
