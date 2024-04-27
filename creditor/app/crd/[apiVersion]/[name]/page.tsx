import CRDForm from '@/components/CRDForm';
import { KubeConfig, ApiextensionsV1Api, V1CustomResourceDefinition } from '@kubernetes/client-node';

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sExtensionsV1Api = kc.makeApiClient(ApiextensionsV1Api);

function customizeSchema(schema: any, apiVersion: string, kind: string) {

    const customizedSchema = Object.assign({}, schema);

    customizedSchema.properties.apiVersion = {

        const: apiVersion,
        default: apiVersion,
        type: "string",
        readOnly: true
    }

    customizedSchema.properties.kind = {
        const: kind,
        default: kind,
        type: "string",
        readOnly: true
    }

    customizedSchema.properties.metadata = {
        type: "object",
        properties: {
            name: {
                type: "string",
                title: "Name"
            },
            annotations: {
                type: 'object',
                additionalProperties: { type: 'string' }
            },
            labels: {
                type: 'object',
                additionalProperties: { type: 'string' }
            },
        },
        required: ["name"]
    }

    delete customizedSchema.properties.status;

    return customizedSchema;


}


export default async function Page({ params }: { params: { apiVersion: string, name: string } }) {

    let request: any;

    try {

        request = await k8sExtensionsV1Api.readCustomResourceDefinition(params.name)
    } catch (e) {
        console.error(e)
    }

    const crd: V1CustomResourceDefinition = request.body;

    // Get the schema for the version that matches the apiVersion

    const filteredVersions = crd.spec.versions.filter(version => version.name === params.apiVersion);

    if (filteredVersions.length !== 1) {
        throw new Error(`Version ${params.apiVersion} not found for CRD ${params.name}`)
    }

    const customizedSchema = customizeSchema(
        filteredVersions[0].schema?.openAPIV3Schema,
        crd.spec.group + "/" + filteredVersions[0].name,
        crd.spec.names.kind
    );

    return (
        <CRDForm
            schema={customizedSchema}
            submitUrl={`/api/crd/${params.name}`}
        />
    )

}
