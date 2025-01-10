import {z} from "zod";
import {OpenAPIRoute} from "chanfana";
import {AppContext, User} from "../types";
import {D1QB} from "workers-qb";

export class SubscribeProperty extends OpenAPIRoute {
    schema = {
        tags: ["User"],
        summary: "Subscribes current user to a property",
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            id: z.string(),
                            property_id: z.string(),
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


        const updateData = {
            subscribed_property: data.body.property_id
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