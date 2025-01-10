import {z} from "zod";
import {OpenAPIRoute} from "chanfana";
import {AppContext} from "../types";
import {D1QB} from "workers-qb";

//cc3e407ff691f00fc03d977f97a94c62033e4db2aba2f284da7df3b9d994222c
export class SetGuide extends OpenAPIRoute {
    schema = {
        tags: ["Guide"],
        summary: "Sets a guide's content by ID",
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            guide_id: z.string(),
                            name: z.string().optional(),
                            content: z.string().optional(),
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
                            result: z.object({
                                id: z.string(),
                                name: z.string(),
                                content: z.string(),
                                created_at: z.number().int(),
                                last_save: z.number().int(),
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

    async handle(c: AppContext) {
        // Validate inputs
        const data = await this.getValidatedData<typeof this.schema>()


        const qb = new D1QB(c.env.DB)


        const updateData =
            {
                name: btoa(data.body.name),
                content: btoa(data.body.content),
                last_save: Date.now() / 1000
            }

        const updated = await qb
            .update({
                tableName: 'mdx_guides',
                data: updateData,
                where: {
                    conditions: 'guide_id = ?1',
                    params: [data.body.guide_id],
                },
            })
            .execute()
        if (updated.success) {

            if (updated.changes && updated.changes > 0) {
                return {success: true};
            } else {
                return Response.json({
                    success: false,
                    errors: ["Guide not found"]
                }, {
                    status: 400,
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