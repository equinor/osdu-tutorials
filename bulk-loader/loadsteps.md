# Preparation
1. Clone data from [test data repo](https://dev.azure.com/slb-des-ext-collaboration/open-data-ecosystem/_git/osdu-test-data)
2. Clone schemas and postman collection from [repo](https://dev.azure.com/slb-des-ext-collaboration/open-data-ecosystem/_git/opendes-osdu-test-data)

## Create Schemas
> __IMPORTANT!__ all schemas __MUST__ be created __BEFORE__ dataload and enrichment executed
1. Schemas have to be loaded manually against the API right now.
2. Update dataload.ini file with created schema kinds

## Update connection properties

> Tokens are short lived and have to exist in dataload.ini and be replaced frequently.

1. Get an OAuth 2.0 relevant for desired prvider (AWS, GCP, Azure)
2. Update the dataload.ini file with the auth token
3. Update dataoad.ini file with proper Storage API endpoint
4. Update dataload.ini file with proper Search API endpoint


## Wells

> __IMPORTANT__ Get Valid Token just before running this step.

1. Dataload 

```
python3 dataload.py --well_dir {path to folder with well manifests}
```

2. Rename execution.log  
```
mv execution.log execution_well.log
```

> __IMPORTANT__ Get Valid Token just before running this step.

3. Enrich 
```
python3 enrichment.py --record_ids execution_well.log
```

4. Rename enrichment.log 
```
mv enrichment.log enrichment_well.log
```

## Wellbore

> __IMPORTANT__ Get Valid Token just before running this step.

1. Dataload 
```
python3 dataload.py --wellbore {path to folder with well manifests}
```

2. Rename execution.log  
```
mv execution.log execution_wellbore.log
```

> __IMPORTANT__ Get Valid Token just before running this step.

3. Enrich 
```
python3 enrichment.py --record_ids execution_wellbore.log
```

4. Rename enrichment.log 
```
mv enrichment.log enrichment_wellbore.log
```



## WellLogs

> __IMPORTANT__ Get Valid Token just before running this step.

1. Dataload 
```
python3 dataload.py --log_dir manifests/work-products/well-logs
```

2. Rename execution.log  
```
mv execution.log execution_welllogs.log
```

> __IMPORTANT__ Get Valid Token just before running this step.

3. Enrich 
```
python3 enrichment.py --record_ids execution_welllogs.log
```

4. Rename enrichment.log 
```
mv enrichment.log enrichment_welllogs.log
```



## Trajectories

> __IMPORTANT__ Get Valid Token just before running this step.

1. Dataload 
```
python3 dataload.py --trajectory_dir manifests/work-products/trajectories
```

2. Rename execution.log  
```
mv execution.log execution_trajectories.log
```

> __IMPORTANT__ Get Valid Token just before running this step.

3. Enrich 
```
python3 enrichment.py --record_ids execution_trajectories.log
```

4. Rename enrichment.log 
```
mv enrichment.log enrichment_trajectories.log
```



## Formation Tops

> __IMPORTANT__ Get Valid Token just before running this step.

1. Dataload 
```
python3 dataload.py --top_dir manifests/work-products/formation-tops
```

2. Rename execution.log  
```
mv execution.log execution_formationtops.log
```

> __IMPORTANT__ Get Valid Token just before running this step.

3. Enrich 
```
python3 enrichment.py --record_ids execution_formationtops.log
```

4. Rename enrichment.log 
```
mv enrichment.log enrichment_formationtops.log
```

# Known issues
1. Enrichment script takes longer to execute that token lifetime. Split execution logs in smaller batches and make sure you refresh your token before each run
2. If manifests are loaded but data is not returned in search result it means that schema was not created prior dataload
3. Data is not indexed if schema was created __AFTER__ data load