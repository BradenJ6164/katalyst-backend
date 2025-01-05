import {z} from 'zod'
import {OpenAPIRoute} from "chanfana";
import {D1QB} from "workers-qb";
import {UserSession} from "../types";

export class AuthLogout extends OpenAPIRoute {
    schema = {
        tags: ['Auth'],
        summary: 'Logout user',
        request: {
            headers: z.object({
                Authorization: z.string()
            })
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

        let token = data.headers.Authorization;
        token = token.replace("Bearer ", "");

        await qb.delete<UserSession>({
            tableName: 'users_sessions',
            where: {
                conditions: [
                    'token = ?1',
                ],
                params: [
                    btoa(token),
                ]
            },
        }).execute()

        return {
            success: true,
        }


    }
}
