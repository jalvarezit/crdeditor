import { KubeConfig, CustomObjectsApi, ApiextensionsV1Api } from '@kubernetes/client-node';

const Debug = require('debug')
const log = Debug('creditor:react:home');

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(CustomObjectsApi);

export const dynamic = 'force-dynamic' // defaults to auto

export async function POST(request: Request, { params }: { params: { name: string } }) {

    try {
        const body = await request.json();

        const [plural, ...rest] = params.name.split(".");
        const group = rest.join('.');
        const namespace = body?.metadata?.namespace ?? "default";
        const apiVersion = body.apiVersion.split("/")[1];

        log("Creating CRD %s in %s/%s", plural, namespace, group);

        const resp = await k8sApi.createNamespacedCustomObject(group, apiVersion, namespace, plural, body);

        if (resp.response.statusCode?.toString().startsWith("2") === false) {
            log("Error creating CRD", resp);

            return new Response("Error creating CRD", {
                status: resp.response.statusCode,
            });
        }

    } catch (error: any) {

        return new Response(error.message, {
            status: 500,
        });
    }

    return new Response('');
}
