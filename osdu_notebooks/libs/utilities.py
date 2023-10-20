from collections import OrderedDict
from datetime import datetime, timezone, timedelta
import numpy as np
import pandas as pd
import json
import time
import requests
import logging

def flatten_json(json_object, container=None, name=''):
    """
    Def: 
        It takes a JSON object and flatents its structure.
        The function calls recursivelly itself to achieve this.
    Args: 
        json_object: JSON or dictionary to be flattened.
        container: Dictionary subclass that preserves the order
        in which the keys are inserted.
    Returns:
        The json_object already flattened.

    """

    if container is None:
        container = OrderedDict()

    if isinstance(json_object, dict):
        for key in json_object:
            flatten_json(json_object[key], container=container, name=name + key + '.')

    elif isinstance(json_object, list):
        for n, item in enumerate(json_object, 1):
            flatten_json(item, container=container,name=name + str(n) + '.')

    else:
        container[str(name[:-1])] = str(json_object)

    return container

def response2df(response_json):
    """
    Def: 
        Creates a dataframe with by fist flattening the input JSON object.
    Args: 
        response_json: JSON or dictionary to be translated into a datarame.
    Returns:
        A dataframe representation of the response_json object.

    """

    df_response=pd.DataFrame()
    counter = 0
    for record in response_json:
        df2append = pd.DataFrame(flatten_json(record), index=[0])
        df_response = pd.concat([df_response, df2append], ignore_index=True)
        counter += 1
        # print(f'{counter}', end='')
        print(f'\r{counter}/{len(response_json)}', end='', flush=True)


    return df_response


def df2dlstorage(df, tablename, writemode="append"):
    """
    Def:
        Transforms a dataframe into an spark dataframe and stores it into the
        OSDU-Synapse datalake as a parquet file.
    Params:
        df: Dataframe to be stored in the datalake.
        tablename (str): Name of the stored parquet file.
        writemode (str): Mode to write the data. Append mode as default.
    Returns:
        None
    """

    response_DF = spark.createDataFrame(df)
    #Rename . to _ (illegal character in Spark)
    renamed_cols = [col.replace('.','_') for col in response_DF.columns]
    response_DF = response_DF.toDF(*renamed_cols)
    renamed_cols = [col.replace(' ','_') for col in response_DF.columns]
    response_DF = response_DF.toDF(*renamed_cols)

    response_DF.write.mode(writemode).saveAsTable(tablename)   


# def search_cursor(payload):
    
#         """Return records of the given type.
#         Args:
#             playload: search criteria
#         Returns:
#             List: [description]
#         """
             
#         results = []
#         cursor = ""

#         payload["limit"] = 1000 #Adding limit; which speeds-up the search    

#         while True:
#             payload["cursor"] = cursor
#             source_data = osdu_client.post_returning_json(search_url_cursor, payload)
#             if source_data["results"]:
#                 results.extend(source_data['results'])
#             cursor = source_data.get('cursor')
#             if cursor is None:
#                 break
#         return results


# def build_url(server, host, json_collection):

    
#     path = f"{osdu_server}{legal_host}"
#     for i in json_collection['request']['url']['path']:
#         path = os.path.join(path, i)
#     return path


def format_date(date):
    new_format = "%Y-%m-%dT%H:%M:%S"
    date = date[:19]
    d1 = datetime.strptime(date,"%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
    return d1.strftime(new_format).date()


def format_date(date):
    new_format = "%Y-%m-%dT%H:%M:%S"
    date = date[:19]
    d1 = datetime.strptime(date,"%Y-%m-%dT%H:%M:%S").replace(tzinfo=timezone.utc)
    d1 = d1.strftime(new_format)
    return datetime.strptime(d1, "%Y-%m-%dT%H:%M:%S").date()

def format_date_new(date):
    if date[-1] == 'Z':
        return datetime.strptime(date[:-1],"%Y-%m-%dT%H:%M:%S.%f")
    elif 'T' not in date:
        return datetime.strptime(date[:10], "%Y-%m-%d")
    elif date[-1] != 'Z':
        return datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%f")
    
def unique_ids_counts(records, dimension):
    return list(set([record[dimension] for record in records]))

def get_non_unique_values(records, dimension):
    duplicates = []
    value_counts = {} 

    for record in records:
        value = record[dimension]
        value_counts[value] = value_counts.get(value, 0) + 1

    for value, count in value_counts.items():
        if count > 1:
            duplicates.append(value)

    return duplicates

def compare_dictionaries(dict1, dict2, path=""):
    
    diff = {}

    for key in dict1:
        new_path = f"{path}.{key}" if path else key
        if key not in dict2:
            diff[new_path] = {
                "record1_value": dict1[key],
                "record2_value": None
            }
        elif dict1[key] != dict2[key]:
            if isinstance(dict1[key], dict) and isinstance(dict2[key], dict):
                sub_diff = compare_dictionaries(dict1[key], dict2[key], new_path)
                diff.update(sub_diff)
            else:
                diff[new_path] = {
                    "record1_value": dict1[key],
                    "record2_value": dict2[key]
                }

    for key in dict2:
        new_path = f"{path}.{key}" if path else key
        if key not in dict1:
            diff[new_path] = {
                "record1_value": None,
                "record2_value": dict2[key]
            }

    return diff

def count_relationships(records1, records2, related_key):
    one_to_one = []
    one_to_many = []
    many_to_one = []
    many_to_many = []
    one_to_none = []
    non_related_records = []
    
    related_values1_count = {}
    related_values2_count = {}

    # Count occurrences in related_values1
    for value in records1:
        key = value[related_key]
        related_values1_count[key] = related_values1_count.get(key, 0) + 1

    # Count occurrences in related_values2
    for value in records2:
        key = value[related_key]
        related_values2_count[key] = related_values2_count.get(key, 0) + 1

    # Identify relationships
    for key, count1 in related_values1_count.items():
        count2 = related_values2_count.get(key, 0)
        
        if count1 == 1 and count2 == 1:
            one_to_one.append(key)
        elif count1 == 1 and count2 > 1:
            one_to_many.append(key)
        elif count1 > 1 and count2 == 1:
            many_to_one.append(key)
        elif count1 > 1 and count2 > 1:
            many_to_many.append(key)
        elif count1 >= 1 and count2 == 0:
            one_to_none.append(key)
            non_related_records.append(key)

    return one_to_one, one_to_many, many_to_one, many_to_many, one_to_none, non_related_records