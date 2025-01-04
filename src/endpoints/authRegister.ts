import {z} from 'zod'
import {OpenAPIRoute} from "chanfana";
import {D1QB} from "workers-qb";
import {User, UserSession} from "../types";
import {hashPassword} from "../utils/hash";

export class AuthRegister extends OpenAPIRoute {
    schema = {
        tags: ['Auth'],
        summary: 'Register user',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            name: z.string(),
                            email: z.string().email(),
                            password: z.string().min(8).max(16),
                            registration_key: z.string().min(8).max(16),
                        }),
                    },
                },
            },
        },
        responses: {
            '200': {
                description: "Successful response",
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            result: z.object({
                                user: z.object({
                                    email: z.string(),
                                    name: z.string()
                                })
                            })
                        }),
                    },
                },
            },
            '400': {
                description: "Error",
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            errors: z.array(z.string())
                        }),
                    },
                },
            },
            '401': {
                description: "Unauthorized",
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            errors: z.array(z.string())
                        }),
                    },
                },
            },
        },
    };

    async handle(c) {
        // Validate inputs
        const data = await this.getValidatedData<typeof this.schema>()

        // Get query builder for D1
        const qb = new D1QB(c.env.DB)

        // Check registration key
        if (data.body.registration_key !== c.env.REGISTRATION_KEY) {
            return Response.json({
                success: false,
                errors: ["Invalid registration key"],
            }, {
                status: 401,
            })
        }


        try {
            // Try to insert a new user
            await qb.insert<{ email: string, name: string, }>({
                tableName: 'users',
                data: {
                    email: data.body.email,
                    name: data.body.name,
                    password: await hashPassword(data.body.password, c.env.SALT_TOKEN),
                },
            }).execute()
        } catch (e) {
            // Insert failed due to unique constraint on the email column
            return Response.json({
                success: false,
                errors: ["User with that email already exists"]
            }, {
                status: 400,
            })
        }

        // Returning an object, automatically gets converted into a json response
        return {
            success: true,
            result: {
                user: {
                    email: data.body.email,
                    name: data.body.name,
                }
            }
        }
    }
}
