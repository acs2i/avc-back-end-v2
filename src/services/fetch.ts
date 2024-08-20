import dotenv from "dotenv";

dotenv.config();

const dataLakeApiKey = process.env.DATA_LAKE_API_KEY
const dataLakeUri = process.env.SERVER_DATA_LAKE_URI_LOCAL;

// include the first "/" but not the last "/"
// example "/reference"
// param can be name or id or any other kind of variable
export const Get = async (endpoint: string, param: string | undefined = undefined, page: number = 1, limit: number= 10, value : string | Record<string, any> | undefined = undefined) : Promise<any> => {
    if(value) {
        if(typeof value === "object") {
            let temp = "&";
            const keys : string[] = Object.keys(value)
            for(let i = 0; i < keys.length; i++ ) {
                const key: string = keys[i]
                const val = value[key]
                if(!val) continue;
                temp += key + "=" +val 
                if(i !== keys.length - 1) temp += "&"
            }
            value = temp;
        } else {
            value = `&value=${value}` 
        }
    }

    console.log("TEST value: " , value)
    console.log(dataLakeUri + endpoint + (param ? `/${param}` : "") + `?page=${page}&limit=${limit}${value}`)
    return await fetch(dataLakeUri + endpoint + (param ? `/${param}` : "") + `?page=${page}&limit=${limit}${value}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "app-id": `${dataLakeApiKey}`
            }
        })
}

export const Post = async(endpoint: string, body: string): Promise<any> => {
    return await fetch(dataLakeUri + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "app-id": `${dataLakeApiKey}`
        },
        body
    })
}

export const Put = async(endpoint: string, body: string): Promise<any> => {
    return await fetch(dataLakeUri + endpoint, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "app-id": `${dataLakeApiKey}`
        },
        body
    })
}


export const Delete  = async ( endpoint: string, id: string) : Promise<any> => {
    return await fetch(dataLakeUri + endpoint + "/" + id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "app-id": `${dataLakeApiKey}`
        },
    })
}