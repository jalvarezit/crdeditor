import React from 'react';
import { KubeConfig, ApiextensionsV1Api } from '@kubernetes/client-node';
import { ListItemButton, ListItemText, List, Grid, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Link from 'next/link';

const kc = new KubeConfig();
kc.loadFromDefault();

const k8sExtensionsV1Api = kc.makeApiClient(ApiextensionsV1Api);

export type DomainMap = {
  [domain: string]: string[];
};

export default async function Home() {

  const response = await k8sExtensionsV1Api.listCustomResourceDefinition();
  const completeNames = response.body.items.map(crd => crd?.metadata?.name);

  let domains: DomainMap = {}

  for (const name of completeNames) {
    if (name === undefined) continue;
    const [simplifiedName, ...rest] = name.split(".");
    const domain = rest.join('.');
    domains[domain] = [...domains[domain] || [], simplifiedName]
  }

  console.log(domains)

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
          {Object.entries(domains).map(([domain, names]) => (
            <Accordion>
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
                  {names.map(name => (
                    <Link href={`/crd/${name}.${domain}`}>
                      <ListItemButton>
                        <ListItemText primary={name} />
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
