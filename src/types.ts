import { DateTime, Str } from "chanfana";
import { z } from "zod";

export const Task = z.object({
	name: Str({ example: "lorem" }),
	slug: Str(),
	description: Str({ required: false }),
	completed: z.boolean().default(false),
	due_date: DateTime(),
});
import {D1Database} from '@cloudflare/workers-types'
import {Context} from "hono";

export type Env = {
	DB: D1Database
	SALT_TOKEN: string
	REGISTRATION_KEY: string
	ICAL_LINK: string
}

export type Vars = {
	user_id?: number
}

export type AppContext = Context<{ Bindings: Env, Variables: Vars }>

export type User = {
	id: number
	email: string
	password: string
	name: string
}

export type UserSession = {
	session_id: number
	user_id: number
	token: string
	expires_at: string
}