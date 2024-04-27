export const dynamic = 'force-dynamic'

import React from 'react';
import { KubeConfig, ApiextensionsV1Api } from '@kubernetes/client-node';
import { ListItemButton, ListItemText, List, Grid, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sExtensionsV1Api = kc.makeApiClient(ApiextensionsV1Api);

export type CRDGroupMap = {
  [group: string]: {
    plural: string;
    apiVersion: string;
  }[];
};

export default async function Home() {

  let response: any;

  try {
    response = await k8sExtensionsV1Api.listCustomResourceDefinition();
  } catch (e) {
    return notFound();
  }

  let groups: CRDGroupMap = {}

  for (const crd of response.body.items) {

    const name = crd?.metadata?.name;
    if (name === undefined) continue;

    const [plural, ...rest] = name.split(".");
    const group = rest.join('.');

    for (const version of crd.spec.versions) {
      groups[group] = [...groups[group] || [], { plural: plural, apiVersion: version.name }]
    }
  }

  return (
    <>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: '100vh' }}
      >
        <Grid item xs={1}>
          {Object.entries(groups).map(([domain, groups]) => (
            <Accordion key={domain}>
              <AccordionSummary
                expandIcon={<ArrowDownwardIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Typography>{domain}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List
                  sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                  component="nav"
                  aria-labelledby="nested-list-subheader"
                >
                  {groups.map(crd => (
                    <Link key={crd.plural + "/" + crd.apiVersion} href={`/crd/${crd.apiVersion}/${crd.plural}.${domain}`}>
                      <ListItemButton>
                        <ListItemText primary={crd.plural + "/" + crd.apiVersion} />
                      </ListItemButton>
                    </Link>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Grid>
      </Grid>
    </>
  );

}
