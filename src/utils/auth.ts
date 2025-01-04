import {D1QB} from "workers-qb";
import {AppContext, UserSession} from "../types";
import {Next} from "hono";

export function getBearer(request: Request): null | string {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || authHeader.substring(0, 6) !== 'Bearer') {
        return null
    }
    return authHeader.substring(6).trim()
}


export async function authenticateUser(c: AppContext, next: Next) {
    const token = getBearer(c.req.raw)

    if (!token) {
        return Response.json({
            success: false,
            errors: "No Authorization token received"
        }, {
            status: 401,
        })
    }

    // Get query builder for D1
    const qb = new D1QB(c.env.DB)

    const session = await qb.fetchOne<UserSession>({
        tableName: 'users_sessions',
        fields: '*',
        where: {
            conditions: [
                'token = ?1',
                'expires_at > ?2',
            ],
            params: [
                token,
                new Date().getTime()
            ]
        },
    }).execute()

    if (!session.results) {
        return Response.json({
            success: false,
            errors: "Authentication error"
        }, {
            status: 401,
        })
    }

    // This will be accessible from the endpoints as c.get('user_id')
    c.set('user_id', session.results.user_id)

    await next()
}