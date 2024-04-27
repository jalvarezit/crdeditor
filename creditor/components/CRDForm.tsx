"use client";
import React, { useState } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { Alert, AlertColor, Backdrop, Box, Button, CircularProgress, Grid, Snackbar, Tab, Tabs } from '@mui/material';
import { IChangeEvent } from '@rjsf/core';
import CodeIcon from '@mui/icons-material/Code';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { CodeBlock, nord } from 'react-code-blocks';
import yaml from 'js-yaml';
import { getSubmitButtonOptions, SubmitButtonProps } from '@rjsf/utils';

enum MenuPage {
    Form = 0,
    CodeBlock = 1,
}

function SubmitButton(props: SubmitButtonProps) {
    const { uiSchema } = props;
    const { norender } = getSubmitButtonOptions(uiSchema);

    return (
        <Box textAlign='center'>
            <Button variant='contained' type='submit'>
                Submit
            </Button>
        </Box>
    );
}

async function submitCrd(endpoint: string, crd: any): Promise<Response> {
    return await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(crd),
    });

}

export default function CRDForm({ schema, submitUrl }: { schema: any, submitUrl: string }) {

    const [menu, setMenu] = useState(MenuPage.Form);
    const [formData, setFormData] = useState(null);
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [snackbarState, setSnackbarState] = useState({
        open: false,
        message: 'Sample message',
        severity: 'success' as AlertColor,
    });

    async function handleSubmit(e: IChangeEvent) {

        setOpenBackdrop(true);

        if (e.errors.length > 0) {
            setSnackbarState({
                open: true,
                message: 'Error validating form',
                severity: 'error',
            });
            return
        }

        const resp = await submitCrd(submitUrl, e.formData)

        if (!resp.ok) {
            setSnackbarState({
                open: true,
                message: 'Error creating CRD',
                severity: 'error',
            });
        } else {
            setSnackbarState({
                open: true,
                message: 'CRD created successfully',
                severity: 'success',
            });

        }

        setOpenBackdrop(false);
    }


    let menuComponent;

    if (menu === MenuPage.CodeBlock) {
        menuComponent = <CodeBlock text={yaml.dump(formData)} language="yaml" theme={nord} />;
    } else {
        menuComponent = <Form
            schema={schema}
            formData={formData}
            validator={validator}
            onChange={(e) => setFormData(e.formData)}
            onSubmit={handleSubmit}
            templates={{ ButtonTemplates: { SubmitButton } }}
        />;
    }

    return (
        <>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
            >

                <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    xs={12}
                    sm={9}
                    md={4}
                >
                    <Grid item xs={12}>

                        <Tabs aria-label="tabs" value={menu.valueOf()}>
                            <Tab icon={< EditNoteIcon />} onClick={() => setMenu(MenuPage.Form)} aria-label="form" />
                            <Tab icon={<CodeIcon />} onClick={() => setMenu(MenuPage.CodeBlock)} aria-label="code" />
                        </Tabs>
                    </Grid>
                    <Grid item xs={6}>
                        {menuComponent}
                    </Grid>

                </Grid>
            </Box>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBackdrop}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar
                open={snackbarState.open}
                key={'bottom' + 'left'}
            >
                <Alert
                    severity={snackbarState.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </>

    );
}
