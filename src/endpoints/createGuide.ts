import {undefined, z} from "zod";
import {OpenAPIRoute} from "chanfana";
import {AppContext, UserSession} from "../types";
import {D1QB} from "workers-qb";
//cc3e407ff691f00fc03d977f97a94c62033e4db2aba2f284da7df3b9d994222c
export class CreateGuide extends OpenAPIRoute {
    schema = {
        tags: ["Guide"],
        summary: "Creates a new guide",
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            name: z.string(),
                            content: z.string(),
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
                                guide_id: z.number(),
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




        const inserted = await qb
            .insert({
                tableName: 'mdx_guides',
                data: {
                    name:  btoa(data.body.name),
                    content: btoa(data.body.content)
                },
            })
            .execute()


        if (inserted.success) {
            const guide = await qb.fetchOne<{}>({
                tableName: 'mdx_guides',
                fields: '*',
                where: {
                    conditions: [
                        'guide_id = ?1',
                    ],
                    params: [
                        inserted.last_row_id
                    ]
                },
            }).execute()

            return {
                success: true,
                result: {
                    guide_id: guide.results.guide_id,
                    name: atob(guide.results.name),
                    content: atob(guide.results.content),
                    created_at: guide.results.created_at,
                    last_save: guide.results.last_save,
                }
            };
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