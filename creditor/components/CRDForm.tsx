"use client";
import React from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { CopyBlock, nord } from "react-code-blocks";
import { Grid } from '@mui/material';
import yaml from 'js-yaml';

export default function CRDForm({ kind, apiVersion, schema }: { kind: string, apiVersion: string, schema: any }) {
    const [formData, setFormData] = React.useState(null);

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
    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={6}>

                    <Form
                        schema={schema}
                        validator={validator}
                        onChange={(e) => {
                            console.log(e.formData)
                            return setFormData(e.formData)
                        }}
                        onSubmit={(e) => {
                            console.log(e.formData)
                        }}
                    />
                </Grid>
                <Grid item xs={6}>
                    <CopyBlock
                        text={yaml.dump(formData)}
                        language="yaml"
                        theme={nord}
                        codeBlock={false}
                    />
                </Grid>
            </Grid>

        </>

    );
}
