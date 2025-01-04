import {z} from "zod";
import {OpenAPIRoute} from "chanfana";
import {AppContext} from "../types";
import ICAL from "ical.js"
import Time from "ical.js/dist/types/time";

interface ReservationData {
    Name: string;
    "Reservation Code": string;
    Property: string;
    Phone: string;
    Email: string;
    Profile: string;
    Adults: number;
    Children: number;
    CheckIn: number;
    CheckOut: number;
}


export class GetCurrentReservation extends OpenAPIRoute {
    schema = {
        tags: ["Reservation"],
        summary: "Get the current active reservation information",
        responses: {
            "200": {
                description: "Successful response",
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            reservation: z.object({
                                Name: z.string(),
                                "Reservation Code": z.string(),
                                Property: z.string(),
                                Phone: z.string(),
                                Email: z.string(),
                                Profile: z.string(),
                                Adults: z.number().int(),
                                Children: z.number().int(),
                                CheckIn: z.number(),
                                CheckOut: z.number(),
                            }).array() || z.undefined()
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        // Validate inputs
        const data = await this.getValidatedData<typeof this.schema>()

        const response = await fetch(c.env.ICAL_LINK);
        const body = await response.text();
        // console.log(body);
        const calendar =new ICAL.Component(ICAL.parse(body));
        const events = calendar.getAllSubcomponents("vevent")

        function parseDataToObject(dataString) {
            // Split the data into lines and process each line
            const lines = dataString.trim().split("\n");
            const result = {};

            lines.forEach(line => {
                const [key, ...valueParts] = line.split(":");
                const keyTrimmed = key.trim();
                const value = valueParts.join(":").trim(); // Join in case of ":" in the value
                if (keyTrimmed && value) {
                    result[keyTrimmed] = value;
                }
            });

            return result;
        }

        let reservation: undefined|ReservationData = undefined;
        events.forEach((event)=>{
            const dtstart = event.getFirstPropertyValue("dtstart") as Time
            const dtend = event.getFirstPropertyValue("dtend") as Time
            const now = Math.floor(Date.now() / 1000)
            if (now>= dtstart.toUnixTime() && now <= dtend.toUnixTime()) {

                reservation = parseDataToObject(event.getFirstPropertyValue("description")) as ReservationData;
                reservation["CheckIn"] = dtstart.toUnixTime();
                reservation["CheckOut"] = dtend.toUnixTime();
            }
        })

        return {
            success: true,
            reservation: reservation
        }

    }
}