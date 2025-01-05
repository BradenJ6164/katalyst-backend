import {z} from "zod";
import {OpenAPIRoute} from "chanfana";
import {AppContext, UserSession} from "../types";
import {D1QB} from "workers-qb";

export class GetGuide extends OpenAPIRoute {
    schema = {
        tags: ["Guide"],
        summary: "Gets a guide by ID",
        request: {
            query: z.object({
                id: z.number(),
            })
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
            "404": {
                description: "No content",
                schema: {
                    "success": false,
                    "errors": "No content"
                },
            },
        },
    };

    async handle(c: AppContext) {
        // Validate inputs
        const data = await this.getValidatedData<typeof this.schema>()

        data.query.id

        const qb = new D1QB(c.env.DB)



        const guide = await qb.fetchOne<{}>({
            tableName: 'mdx_guides',
            fields: '*',
            where: {
                conditions: [
                    'guide_id = ?1',
                ],
                params: [
                   data.query.id
                ]
            },
        }).execute()
        // console.log(guide.results)
        if (guide.results) {
            return {
                success: true,
                result: {
                    guide_id: guide.results.guide_id,
                    name: atob(guide.results.name),
                    content: atob(guide.results.content),
                    created_at: guide.results.created_at,
                    last_save: guide.results.last_save,
                }
            }
        }

        return Response.json({
            success: false,
            errors: ["No content/guide"]
        }, {
            status: 404,
        })
    }
}