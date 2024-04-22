import { KubeConfig, ApiextensionsV1Api } from '@kubernetes/client-node';


export const dynamic = 'force-dynamic' // defaults to auto
export async function POST(request: Request) {
    const res = await request.json()

    console.log(res)

    return new Response('Hello from Next.js!', {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
