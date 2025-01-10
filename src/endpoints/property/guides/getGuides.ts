import {z} from "zod";
import {OpenAPIRoute} from "chanfana";
import {AppContext} from "../types";
import {D1QB} from "workers-qb";

export class GetGuides extends OpenAPIRoute {
    schema = {
        tags: ["Guide"],
        summary: "Gets all guides",
        request: {
            query: z.object({
                property_id: z.string().optional()
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
                                guide_id: z.string(),
                                name: z.string(),
                                created_at: z.number().int(),
                                last_save: z.number().int(),
                            }).array()
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

        const qb = new D1QB(c.env.DB)


        const query = data.query.property_id

        const guide = await qb.fetchAll<{}>({
            tableName: 'mdx_guides',
            fields: ['guide_id', 'name', 'created_at', 'last_save'],
            where: {
                conditions: [
                    'property_id = ?1',
                ],
                params: [
                    query
                ]
            },
        }).execute()
        // console.log(guide.results)
        if (guide.results && guide.results.length > 0) {
            return {
                success: true,
                result: guide.results.map((guide) => {
                    const newGuide = {...guide}
                    newGuide.name = atob(newGuide.name)
                    return newGuide
                })
            }
        }

        return Response.json({
            success: false,
            errors: ["No guides"]
        }, {
            status: 404,
        })
    }
}