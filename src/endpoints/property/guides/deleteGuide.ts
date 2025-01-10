import {z} from 'zod'
import {OpenAPIRoute} from "chanfana";
import {D1QB} from "workers-qb";

export class DeleteGuide extends OpenAPIRoute {
    schema = {
        tags: ['Guide'],
        summary: 'Deletes a guide by id',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            guide_id: z.string(),
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


        const result = await qb.delete<{}>({
            tableName: 'mdx_guides',
            where: {
                conditions: [
                    'guide_id = ?1',
                ],
                params: [
                    data.body.guide_id,
                ]
            },
        }).execute()
        if (result.success) {
            if (result.changes && result.changes > 0) {
                return {
                    success: true,
                }
            } else {
                return Response.json({
                    success: false,
                    errors: ["No guide found"]
                }, {
                    status: 400,
                })
            }
        }
        return Response.json({
            success: false,
            errors: ["Database error"]
        }, {
            status: 400,
        })


    }
}
