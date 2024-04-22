import CRDForm from '@/components/CRDForm';
import { KubeConfig, ApiextensionsV1Api, V1CustomResourceDefinition } from '@kubernetes/client-node';
import { read } from 'fs';

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sExtensionsV1Api = kc.makeApiClient(ApiextensionsV1Api);

export default async function Page({ params }: { params: { crd: string } }) {

    let request: any;
    try {

        request = await k8sExtensionsV1Api.readCustomResourceDefinition(params.crd)
    } catch (e) {
        console.error(e)
    }

    const crd: V1CustomResourceDefinition = request.body;

    for (const version of crd.spec.versions) {
        // console.log(version.schema?.openAPIV3Schema)
    }

    const schema: any = Object.assign(
        {},
        crd.spec.versions[0].schema?.openAPIV3Schema
    )

    return (
        <CRDForm
            kind={crd.spec.names.kind}
            apiVersion={crd.spec.versions[0].name}
            schema={schema}
        />
    )

}
