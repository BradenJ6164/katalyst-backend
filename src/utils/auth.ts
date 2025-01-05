import {AppContext} from "../types";
import {Next} from "hono";
import jwt from "@tsndr/cloudflare-worker-jwt";

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
    c.set('user_id', verifiedToken.payload.user)

    await next()
}