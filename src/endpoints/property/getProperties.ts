import {z} from "zod";
import {OpenAPIRoute} from "chanfana";
import {AppContext} from "../types";
import {D1QB} from "workers-qb";
import {Property} from "../../types";

export class GetProperties extends OpenAPIRoute {
    schema = {
        tags: ["Property"],
        summary: "Gets the current property information",
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


        const properties = await qb.fetchAll<{}>({
            tableName: "property_permissions",
            fields: 'property_id',
            where: {
                conditions: [
                    'user_id = ?1',
                ],
                params: [
                    c.get('user_id')
                ]
            },
        }).execute()


        if (properties.results && properties.results.length > 0) {
            const allPropertyData: Property[] = []
            for (const propertyID of properties.results as { property_id: string }[]) {
                const propertyData = await qb.fetchOne<Property>({
                    tableName: "property_settings",
                    fields: '*',
                    where: {
                        conditions: [
                            'property_id = ?1',
                        ],
                        params: [
                            propertyID.property_id
                        ]
                    },
                }).execute()
                if (propertyData.results && propertyData.results.property_id) {
                    allPropertyData.push({
                        property_id: propertyData.results.property_id,
                        name: atob(propertyData.results.name),
                        address: atob(propertyData.results.address),
                        description: atob(propertyData.results.description),
                        owner: (propertyData.results.owner)
                    })
                }


            }
            if (allPropertyData.length <= 0) {
                return Response.json({
                    success: false,
                    errors: ["No content/property"]
                }, {
                    status: 404,
                })
            }
            return {
                success: true,
                result: allPropertyData
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