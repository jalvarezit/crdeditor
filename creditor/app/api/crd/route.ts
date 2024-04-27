import { KubeConfig, ApiextensionsV1Api } from '@kubernetes/client-node';

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sExtensionsV1Api = kc.makeApiClient(ApiextensionsV1Api);

export async function GET(_: Request, { params }: { params: { name: string } }) {

    try {
        const response = await k8sExtensionsV1Api.listCustomResourceDefinition();
        const completeNames = response.body.items.map(crd => crd?.metadata?.name);

        return new Response(JSON.stringify(completeNames), {
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
