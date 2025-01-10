import {z} from "zod";
import {OpenAPIRoute} from "chanfana";
import {AppContext, User} from "../types";
import {D1QB} from "workers-qb";

export class SetUser extends OpenAPIRoute {
    schema = {
        tags: ["User"],
        summary: "Sets a user's information by ID",
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            id: z.string(),
                            name: z.string().optional(),
                            email: z.string().optional(),
                            role: z.string().optional(),
                            avatar: z.string().optional(),
                        }),
                    },
                },
            },
        },
        responses: {
            "200": {
                description: "Successful response",
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                        }),
                    },
                },
            },
            '404': {
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
            '403': {
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

    async handle(c: AppContext) {
        // Validate inputs
        const data = await this.getValidatedData<typeof this.schema>()


        const qb = new D1QB(c.env.DB)

        // Check Authorized
        if (data.body.id !== c.get("user_id")) {
            return Response.json({
                success: false,
                errors: ["Not authorized to edit this user"]
            }, {
                status: 403,
            })
        }

        const user = await qb.fetchOne<User>({
            tableName: 'users',
            fields: '*',
            where: {
                conditions: [
                    'id = ?1',
                ],
                params: [
                    data.body.id,
                ]
            },
        }).execute()
        if (!user.results) {
            return Response.json({
                success: false,
                errors: ["User not found"]
            }, {
                status: 404,
            })
        }

        // safety to prevent password change
        delete data.body.password

        const updateData = {
            name: (data.body.name),
            email: (data.body.email),
            avatar: (data.body.avatar),
        }

        const updated = await qb
            .update({
                tableName: 'users',
                data: updateData,
                where: {
                    conditions: 'id = ?1',
                    params: [data.body.id],
                },
            })
            .execute()
        if (updated.success) {

            if (updated.changes && updated.changes > 0) {
                return {success: true};
            } else {
                return Response.json({
                    success: false,
                    errors: ["User not found"]
                }, {
                    status: 404,
                })
            }


        } else {
            return Response.json({
                success: false,
                errors: ["Database error"]
            }, {
                status: 400,
            })
        }


    }
}