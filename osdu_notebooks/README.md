# osdu_notebooks

The osdu_notebooks folder contains few introductory examples to help you get started with OSDU practically.

## Folder Structure

```text
├──libs
│   ├──osdu_environment_config.py
│   ├──osdu_http_client.py
│   └──utilities.py
├──Osdu specific
│   ├──1. osdu_requests (non-Interactive oauth).ipynb   ──> Understanding Microsoft non-interactive oauth.
│   ├──2. osdu_requests (interactive oauth).ipynb       ──> Understanding Microsoft interactive oauth.
│   ├──3. osdu_requests (token oauth).ipynb             ──> Understanding Microsoft token-based oauth.
│   ├──4. osdu_environment_config.ipynb                 ──> Creating a class to parametrize the required oauth variables.
│   ├──5. osdu_http_client.ipynb                        ──> Creating an Osdu Http client class.
│   ├──6. osdu_records_monitor.ipynb                    ──> Get record couns for all osdu envs DEV, TEST, PROD.
│   ├──7. Search API.ipynb                              ──> Search API examples.
│   ├──8. Record aggregations by tags.ipynb             ──> Cluster records by schema kind and tags.
│   └──9. Record_patching (acl groups).ipynb            ──> Patch operation example.
├──Seismic metadata ingestion SDB & diskos related      ──> SDB/Diskos pipeline QC notebooks.
├──.env_example                                         ──> Example of configuration variables.
└──README.md
```