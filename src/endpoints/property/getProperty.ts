import {z} from "zod";
import {OpenAPIRoute} from "chanfana";
import {AppContext} from "../types";
import {D1QB} from "workers-qb";

export class GetProperty extends OpenAPIRoute {
    schema = {
        tags: ["Property"],
        summary: "Gets the current property information",
        request: {
            query: z.object({
                id: z.string()
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
                                property_id: z.string(),
                                name: z.string(),
                                address: z.string(),
                                description: z.string(),
                                created_at: z.number().int(),
                                last_save: z.number().int(),
                            })
                        }),
                    },
                },
            },
            "404": {
                description: "No property",
                schema: {
                    "success": false,
                    "errors": "No property"
                },
            },
        },
    };

    async handle(c: AppContext) {
        // Validate inputs
        const data = await this.getValidatedData<typeof this.schema>()


        const qb = new D1QB(c.env.DB)


        let property
        if (data.query.id !== undefined) {
            property = await qb.fetchOne<{}>({
                tableName: 'property_settings',
                fields: '*',
                where: {
                    conditions: [
                        'property_id = ?1',
                    ],
                    params: [
                        data.query.id
                    ]
                },
            }).execute()
        } else {
            property = await qb.fetchOne<{}>({
                tableName: 'property_settings',
                fields: '*',
                where: {
                    conditions: [
                        'id = ?1',
                    ],
                    params: [
                        1
                    ]
                },
            }).execute()
        }

        // console.log(guide.results)
        if (property.results) {
            return {
                success: true,
                result: {
                    property_id: property.results.property_id,
                    name: atob(property.results.name),
                    address: atob(property.results.address),
                    description: atob(property.results.description),
                    created_at: property.results.created_at,
                    last_save: property.results.last_save,
                }
            }
        }

        return Response.json({
            success: false,
            errors: ["No content/property"]
        }, {
            status: 404,
        })
    }
}