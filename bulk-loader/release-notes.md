# Release Notes

## April 16th, 2020
1. Fix vertical measurement kinds names both in schemas and in configs. Affected schemas:
    * FacilityVerticalMeasurementPath_schema.json → VerticalMeasurementPath_schema.json
    * FacilityVerticalMeasurementSource_schema.json → VerticalMeasurementSource_schema.json
    
    Change their names in **kind_mapping.ini** accordingly.
    ~~~
    [DEFAULT]
    ...
    verticalmeasurementpath = vertical-measurement-path
    verticalmeasurementsource = vertical-measurement-source
    ...
    ~~~
2. Add new reference data kinds to **[COUNTS]** and **[KINDS_TO_COUNTS_MAPPING]** of **test.ini**. Examples:
    ~~~
    ...
    [COUNTS]
    anisotropy_type = 5
    bin_grid_definition_method_type = 2
    contractor_type = 4
    dimension_type = 6
    discretization_scheme_type = 3
    ...
    [KINDS_TO_COUNTS_MAPPING]
    anisotropy-type = anisotropy_type
    bin-grid-definition-method-type = bin_grid_definition_method_type
    contractor-type = contractor_type
    dimension-type = dimension_type
    discretization-scheme-type = discretization_scheme_type
    petroleum-system-element-type = reference_data
    ...
    ~~~
3. Add new **replace_file_path.py** - Utility script for updating `PreLoadFilePath` field value in **work-product** manifests
    ~~~
    python replace_file_path.py --manifests_dir <manifests_dir>
    ~~~
    Check updated **readme.md** for detailed launch instructions.

## April 15th, 2020
1. Add new seismic reference data schemas:
    * BinGridDefinitionMethodType.json
    * ProcessingParameterType.json
    * SeismicDomainType.json
    * SeismicEnergySourceType.json
    * SeismicFilteringType.json
    * SeismicHorizonType.json
    * SeismicMigrationType.json
    * SeismicPickingType.json
    * SeismicStackingType.json
    * SeismicTraceDataDimensionalityType.json
2. Add new reference data schemas:
    * AnisotropyType.json
    * DimensionType.json
    * DiscretizationSchemeType.json
    * InterpolationMethod_schema.json
    * ObjectiveType_schema.json
    * PetroleumSystemElementType.json
    * PropertyFieldRepresentationType_schema.json
    * PropertyNameType.json
    * SeismicAttributeType.json
    * SeismicBinGridType_schema.json
    * SeismicFaultType.json
    * SeismicProcessingStageType.json
    * SeismicWaveType.json
    * VelocityAnalysisMethod.json
    * VelocityDirectionType_schema.json
    * VelocityType.json
    * VerticalMeasurementType_schema.json
3. Add new script **update_artefacts.py** for post updating the WPC with the new file srn in the Artefacts and 
ArtefactFiles section. 
    ~~~
    python update_artefacts.py  --artefact-path <preload_file_path> --artefact-kind <artefact_file_kind> 
   --record-ids <record_ids> --kind-to-update <kind> 
    ~~~
    Check updated **readme.md** for detailed launch instructions.
4. Add next field to **seismic trace data wpc** search schema and search schema template:
    ~~~
    {
        "path": "Data.ExtensionProperties.ArtefactFiles",
        "kind": "[]string",
        "ext": {}
    },
    ~~~
5. Add **data_cleaner.py** script for deleting records from storage. Use a csv file with a list of records to delete:
    ~~~
    python data_cleaner.py --purge_file_path execution.log
    ~~~
6. The file **enrichment.log** contains only enriched records ids now.
7. Timestamps in **execution.log** and **enrichment.log** files names.

    Examples:
    
    **execution_2020-04-13T12:23:09.641303.log**
    
    **enrichment_2020-04-13T13:06:53.373514.log**

## April 14th, 2020
1. Add logging of record ids that could not be enriched to log file (e.g. 
**enrichment_errors_2020-04-14T14:15:29.993310.log**).

## April 13th, 2020
1. Change UWI and UWBI parameters type in schemas from integer to string:
    ~~~
    ...
    {
      "path": "UWI",
      "kind": "string",
      "ext": {}
    },
    {
      "path": "UWBI",
      "kind": "string",
      "ext": {}
    },
    ...
    ~~~
    Affected files: **well-master.json**, **wellbore-master.json**, **wellboremarker-wpc.json**, 
    **wellboretrajectory-wpc.json**, and **welllog-wpc.json**.
2. Change getting UWI and UWBI. It has to be extracted from **FacilityNameAlias** section of manifest instead of 
    **ResourceID**:
    ~~~
    {
        ...
        "Manifest": {
            "ResourceID": "srn:master-data/Well:1000:",
            ...
            "Data": {
                "IndividualTypeProperties": {
                    ...
                    "FacilityNameAlias": [
                        ...
                        {
                            "AliasName": "1000",
                            "AliasNameTypeID": "srn:reference-data/AliasNameType:UWI:"
                        }
                    ],
                    ...
                }
            }
        }
    }
    ~~~

## April 9th, 2020
1. Finalize postman collections. All tests are ready to use now.
2. Add reference data to **test_uploaded_data_count.py** and update it to use kinds from **dataload.ini** and counts 
and mapping from kind to counts from **test.ini**.
    ~~~
    ...
    [COUNTS]
    wells = 4947
    wellbores = 6485
    ;markers or tops
    markers = 5904
    trajectories = 5944
    logs = 929
    files = 12777
    documents = 9
    seismic_acquisition_projects = 1
    seismic_interpretation_projects = 1
    seismic_processing_projects = 1
    seismic_trace_data = 2
    seismic_horizon = 2
    reference_data = 1
    ...
    [KINDS_TO_COUNTS_MAPPING]
    ;master-data
    well-master = wells
    wellbore-master = wellbores
    
    ;markers
    wellboremarker-wp = markers
    wellboremarker-wpc = markers
    
    ;trajectories
    wellboretrajectory-wp = trajectories
    wellboretrajectory-wpc = trajectories
    
    ;logs
    welllog-wp = logs
    welllog-wpc = logs
    
    ;files
    file = files
    
    ;documents
    document-wp = documents
    document-wpc = documents
    
    ;seismic-data
    seismic-acquisition-project = seismic_acquisition_projects
    ...
    
    ;reference-data
    facility-type = reference_data
    ...
    ~~~
3. Next schemas templates were updated:  
**AliasNameType_schema.json**  
**FacilityVerticalMeasurementPath_schema.json**  
**FacilityVerticalMeasurementSource_schema.json**  
**FacilityVerticalMeasurementType_schema.json**  
**UnitOfMeasure_schema.json**  
For all schemes were made the same changes: type-specific field names have been changed to universal names (according changes in 
[definitions](https://dev.azure.com/slb-des-ext-collaboration/open-data-ecosystem/_git/osdu-test-data?path=%2F3-schema) schemas and 
[manifests](https://dev.azure.com/slb-des-ext-collaboration/open-data-ecosystem/_git/osdu-test-data?version=GBmaster_osdu_r2_updated&path=%2F4-instances)).
4. Add **schemas_cleanup.py** script for deleting redundant schemas from storage. Set the list of schemas to delete in 
the script constant **KINDS_TO_DELETE**:
    ~~~
    KINDS_TO_DELETE = [
    "opendes:osdu:facility_type:0.2.0",
    ...
    ]
    ~~~
    Run the script with:
    ~~~
    python schemas_cleanup.py  
    ~~~
   
## April 7th, 2020
### Changes:
1. New collection of integration tests for seismic data  *test/R2 Integration Tests [Volve].postman_collection.json*.
Check `readme.md` in `test` directory for launch instructions.

    Results of running new test scripts ( ✓ - the test is passed, no ✓ - the test is not passed):
    ~~~
    R2 Integration Tests [Volve]
    
    ❏ Smoke
    ↳ 1. Refresh Tokens
      POST https://oauth2.googleapis.com/token [200 OK, 1.82KB, 315ms]
      ✓  Status code is 200
    
    ↳ 2. Get Schemas
      GET https://os-storage-dot-opendes.appspot.com/api/storage/v2/query/kinds?limit=9999 [200 OK, 48.16KB, 2.8s]
      ✓  Status code is 200
      ✓  schema opendes:osdu:seismic-acquisition-project:3.0.62 should be present
      ✓  schema opendes:osdu:seismic-interpretation-project:3.0.62 should be present
      ✓  schema opendes:osdu:seismic-processing-project:3.0.62 should be present
      ✓  schema opendes:osdu:seismictracedata-wp:3.0.62 should be present
      ✓  schema opendes:osdu:seismictracedata-wpc:3.0.62 should be present
      ✓  schema opendes:osdu:seismichorizon-wp:3.0.62 should be present
      ✓  schema opendes:osdu:seismichorizon-wpc:3.0.62 should be present
    
    ↳ 3. Count Records By Kind
      POST https://os-search-dot-opendes.appspot.com/api/search/v2/query [200 OK, 3.29KB, 839ms]
      ✓  Status code is 200
      1. Valid count for aggregation opendes:osdu:seismic-acquisition-project:3.0.62
      2. Valid count for aggregation opendes:osdu:seismic-interpretation-project:3.0.62
      3. Valid count for aggregation opendes:osdu:seismic-processing-project:3.0.62
      4. Valid count for aggregation opendes:osdu:seismictracedata-wp:3.0.62
      5. Valid count for aggregation opendes:osdu:seismictracedata-wpc:3.0.62
      6. Valid count for aggregation opendes:osdu:seismichorizon-wp:3.0.62
      7. Valid count for aggregation opendes:osdu:seismichorizon-wpc:3.0.62
    
    ❏ Search
    ↳ 1. Get Aquisition Project By Name
      POST https://os-search-dot-opendes.appspot.com/api/search/v2/query [200 OK, 5.09KB, 665ms]
      ✓  Status code is 200
      ✓  Expected correct response structure
      8. Expected result count
    
    ↳ 2. Get All Processing Projects for Aquisition Project (Children)
      POST https://os-search-dot-opendes.appspot.com/api/search/v2/query [200 OK, 2.96KB, 310ms]
      ✓  Status code is 200
      ✓  Expected correct response structure
      9. Expected result count
    
    ↳ 3. Get Aquisition Projects By Operator
      POST https://os-search-dot-opendes.appspot.com/api/search/v2/query [200 OK, 5.09KB, 643ms]
      ✓  Status code is 200
      ✓  Expected correct response structure
     10. Expected result count
    
    ↳ 4. Get Aquisition Projects Between X and Y
      POST https://os-search-dot-opendes.appspot.com/api/search/v2/query [200 OK, 5.09KB, 671ms]
      ✓  Status code is 200
      ✓  Expected correct response structure
     11. Expected result count
    
    ↳ 5. Get Aquisition Projects With Cable Length Greater Than X
      POST https://os-search-dot-opendes.appspot.com/api/search/v2/query [200 OK, 5.09KB, 254ms]
      ✓  Status code is 200
      ✓  Expected correct response structure
     12. Expected result count
    
    ↳ 6. [X] Get Trace by Geographic Region
      POST https://os-search-dot-opendes.appspot.com/api/search/v2/query [400 Bad Request, 974B, 599ms]
     13. Status code is 200
     14. Expected correct response structure
    
    ↳ 7. Get Trace by Domain Type (Depth/Time)
      POST https://os-search-dot-opendes.appspot.com/api/search/v2/query [200 OK, 15.61KB, 242ms]
      ✓  Status code is 200
      ✓  Expected correct response structure
     15. Expected result count
    
    ↳ 8. [X] Get Horizon by Geographic Region
      POST https://os-search-dot-opendes.appspot.com/api/search/v2/query [400 Bad Request, 974B, 193ms]
     16. Status code is 200
     17. Expected correct response structure
    
    ↳ 9. Get Horizon by Name
      POST https://os-search-dot-opendes.appspot.com/api/search/v2/query [200 OK, 4.92KB, 237ms]
      ✓  Status code is 200
      ✓  Expected correct response structure
     18. Expected result count
    
    ↳ 10. Get Horizon by GeologicalUnitAgePeriod & GeologicalUnitName (wildcards)
      POST https://os-search-dot-opendes.appspot.com/api/search/v2/query [200 OK, 4.92KB, 626ms]
      ✓  Status code is 200
      ✓  Expected correct response structure
     19. Expected result count
    
    ❏ Delivery
    ↳ Get Signed URL (Storage API)
      POST https://os-storage-dot-opendes.appspot.com/api/storage/v2/delivery/GetFileSignedURL [404 Not Found, 751B, 593ms]
     20. Status code is 200
    ~~~
2. Add seismic horizon kind for test script:
    * add kind entities and count numbers to respective sections of **test.ini**:
      ~~~~
      ...
      [KIND_ENTITIES]
      seismic_horizon_work_product = seismichorizon-wp
      seismic_horizon_work_product_component = seismichorizon-wpc
      ...
      [NUMBERS]
      seismic_horizon = 2
      ...
      ~~~~
    * add kinds to CONFIG_NAMES_MAPPINGS constant in **test_uploaded_data_count.py**:
      ~~~
      CONFIG_NAMES_MAPPINGS = {
        ...
        "seismichorizon-wp": "seismic_horizon",
        "seismichorizon-wpc": "seismic_horizon"
      }
      ~~~

## April 2nd, 2020

### Changes:

1. Add support for seismic horizon data and seismic trace data:
    * load new versions of schema templates in seismic folder in [templates repository](https://dev.azure.com/slb-des-ext-collaboration/open-data-ecosystem/_git/opendes-osdu-test-data?path=%2Fschemas_templates&version=GBtemplates):
      * new schemas:
        * seismichorizon-wp.json
        * seismichorizon-wpc.json
      * updated schemas:
        * seismictracedata-wp.json
        * seismictracedata-wpc.json
    * add **seismichorizon_wp** and **seismichorizon_wpc** options to **kind_mapping.ini** config:
      ~~~
      ...
      [DEFAULT]
      seismichorizon_wp = seismichorizon-wp
      seismichorizon_wpc = seismichorizon-wpc
      ...
      ~~~
    * add **seismichorizon_wp_kind** and **seismichorizon_wpc_kind** options to **dataload.ini** config:
      ~~~
      ...
      [KINDS_INITIAL]
      seismichorizon_wp_kind = opendes:osdu:seismichorizon-wp:{{ version }}
      seismichorizon_wpc_kind = opendes:osdu:seismichorizon-wpc:{{ version }}
      ...
      ~~~

## April 1st, 2020

### Changes:

1. Add support for documents data:
    * download new schema templates from [templates repository](https://dev.azure.com/slb-des-ext-collaboration/open-data-ecosystem/_git/opendes-osdu-test-data?path=%2Fschemas_templates&version=GBtemplates).
    * add **document_wp** and **document_wpc** options to **kind_mapping.ini** config:
      ~~~
      ...
      [DEFAULT]
      document_wp = document-wp
      document_wpc = document-wpc
      ...
      ~~~
    * add **document_wp_kind** and **document_wpc_kind** options to **dataload.ini** config:
      ~~~
      ...
      [KINDS_INITIAL]
      document_wp_kind = opendes:osdu:document-wp:{{ version }}
      document_wpc_kind = opendes:osdu:document-wpc:{{ version }}
      ...
      ~~~
    * add **document_work_product** and **document_work_product_component** option to **test.ini** config:
      ~~~
      ...
      [KIND_ENTITIES]
      document_work_product = document-wp
      document_work_product_component = document-wpc
      ...
      ~~~

2. Fix files naming in **test.ini** config:
    ~~~
    ...
    [KIND_ENTITIES]
    files = file
    ...
    [NUMBERS]
    files = 12777
    ...
    ~~~
   
### Testing guide:

1. Run **create_schema.py**, **dataload.py**, and **test_uploaded_data_count.py** to upload new data. 

    **Note:** if you already have this schema version in storage use **dataload.py** with documents directory only (to 
    eliminate duplication of already loaded data).

2. Check that data was uploaded to storage using this either of this payloads in search queries:
    ~~~
    {
      "kind": "opendes:osdu:document-wp:{{ version }}",
      "limit": 100
    }
    ~~~
    ~~~
    {
      "kind": "opendes:osdu:document-wpc:{{ version }}",
      "limit": 100
    }
    ~~~