import {AppContext, User} from "../types";
import {Next} from "hono";
import jwt from "@tsndr/cloudflare-worker-jwt";
import {D1QB} from "workers-qb";

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
            errors: ["No Authorization token received"]
        }, {
            status: 401,
        })
    }

    // jwt verify
    const verifiedToken = await jwt.verify(token, c.env.SALT_TOKEN)
    if (!verifiedToken) {
        return Response.json({
            success: false,
            errors: ["Authentication error"]
        }, {
            status: 401,
        })
    }
    const qb = new D1QB(c.env.DB)
    const userResult = await qb.fetchOne<User>({
        tableName: 'users',
        fields: '*',
        where: {
            conditions: [
                'id = ?1',
            ],
            params: [
                verifiedToken.payload.user
            ]
        },
    }).execute()

    if (userResult) {
        c.set('user_id', userResult.results.id)
        c.set('email', (userResult.results.email))
        c.set('name', (userResult.results.name))
        c.set('avatar', (userResult.results.avatar))
        c.set('role', userResult.results.role)
    } else {
        return Response.json({
            success: false,
            errors: ["User destroyed"]
        }, {
            status: 500,
        })
    }
    // Get query builder for D1
    // const qb = new D1QB(c.env.DB)
    //
    // const session = await qb.fetchOne<UserSession>({
    //     tableName: 'users_sessions',
    //     fields: '*',
    //     where: {
    //         conditions: [
    //             'token = ?1',
    //             'expires_at > ?2',
    //         ],
    //         params: [
    //             btoa(token),
    //             new Date().getTime()
    //         ]
    //     },
    // }).execute()
    //
    // if (!session.results) {
    //     return Response.json({
    //         success: false,
    //         errors: ["Authentication error"]
    //     }, {
    //         status: 401,
    //     })
    // }


    // This will be accessible from the endpoints as c.get('user_id')

    await next()
}