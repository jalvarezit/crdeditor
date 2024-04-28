import { KubeConfig, CustomObjectsApi, ApiextensionsV1Api } from '@kubernetes/client-node';

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(CustomObjectsApi);
const k8sExtensionsV1Api = kc.makeApiClient(ApiextensionsV1Api);

export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: Request, { params }: { params: { name: string } }) {

    try {
        const resp = await k8sExtensionsV1Api.listCustomResourceDefinition(params.name);

        return new Response(JSON.stringify(resp.body), {
            headers: {
                'content-type': 'application/json',
            },
        });

    } catch (error) {

        if (error instanceof Error) {

            return new Response(error.message, {
                status: 500,
            });
        }

        return new Response('Unknown error', {
            status: 500,
        });
    }

}

export async function POST(request: Request, { params }: { params: { name: string } }) {

    try {
        const body = await request.json();

        const [plural, ...rest] = params.name.split(".");
        const group = rest.join('.');
        const namespace = body?.metadata?.namespace ?? "default";
        const apiVersion = body.apiVersion.split("/")[1];

        const resp = await k8sApi.createNamespacedCustomObject(group, apiVersion, namespace, plural, body);

    } catch (error) {

        if (error instanceof Error) {

            return new Response(error.message, {
                status: 500,
            });
        }

        return new Response('Unknown error', {
            status: 500,
        });
    }

    return new Response('');
}
