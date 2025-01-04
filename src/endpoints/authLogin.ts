import {z} from 'zod'
import {OpenAPIRoute} from "chanfana";
import {D1QB} from "workers-qb";
import {User, UserSession} from "../types";
import {hashPassword} from "../utils/hash";

export class AuthLogin extends OpenAPIRoute {
    schema = {
        tags: ['Auth'],
        summary: 'Login user',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            email: z.string().email(),
                            password: z.string().min(8).max(16),
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
                                session: z.object({
                                    token: z.string(),
                                    expires_at: z.number().int()
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
                            error: z.string()
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

        // Try to fetch the user
        const user = await qb.fetchOne<User>({
            tableName: 'users',
            fields: '*',
            where: {
                conditions: [
                    'email = ?1',
                    'password = ?2'
                ],
                params: [
                    data.body.email,
                    await hashPassword(data.body.password, c.env.SALT_TOKEN)
                ]
            },
        }).execute()

        // User not found, provably wrong password
        if (!user.results) {
            return Response.json({
                success: false,
                errors: "Unknown user"
            }, {
                status: 400,
            })
        }


        // User found, define expiration date for new session token
        let expiration = new Date();
        expiration.setDate(expiration.getDate() + 7);

        // Insert session token
        const session = await qb.insert<UserSession>({
            tableName: 'users_sessions',
            data: {
                user_id: user.results.id,
                token: await hashPassword((Math.random() + 1).toString(3), c.env.SALT_TOKEN),
                expires_at: expiration.getTime()
            },
            returning: '*'
        }).execute()

        // Returning an object, automatically gets converted into a json response
        return {
            success: true,
            result: {
                session: {
                    token: session.results.token,
                    expires_at: session.results.expires_at,
                }
            }
        }
    }
}
