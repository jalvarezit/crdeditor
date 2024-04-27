export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
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
                title: "Name",
                pattern: "^[a-z0-9][-a-z0-9]{0,251}[a-z0-9]$"
            },
            annotations: {
                type: 'object',
                additionalProperties: { type: 'string' }
            },
            labels: {
                type: 'object',
                patternProperties: {
                    "^[a-z0-9][-a-z0-9]{0,61}[a-z0-9]$": { type: 'string' }
                }
            },
        },
        required: ["name"]
    }

    delete customizedSchema.properties.status;

    return customizedSchema;


}


export default async function Page({ params }: { params: { apiVersion: string, name: string } }) {

    let response: any;

    try {
        response = await k8sExtensionsV1Api.readCustomResourceDefinition(params.name)
    } catch (e) {
        return notFound();
    }

    const crd: V1CustomResourceDefinition = response.body;

    // Get the schema for the version that matches the apiVersion
    const filteredVersions = crd.spec.versions.filter(version => version.name === params.apiVersion);

    if (filteredVersions.length !== 1) {
        return notFound();
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
