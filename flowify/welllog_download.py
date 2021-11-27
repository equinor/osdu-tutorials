"""
This script is used to download the well log datasets from osdu by given well log id.
"""
import os
import json
import requests

from typing import List
from termcolor import colored
from requests.compat import urljoin


def get_access_token() -> str:
    """
    Update access token by refresh token

    Return(str): Access Token
    """
    token_url = os.environ.get("TOKEN_URL")

    client_id = os.environ.get("CLIENT_ID")
    client_secret = os.environ.get("CLIENT_SECRET")
    refresh_token = os.environ.get("REFRESH_TOKEN")

    scope = f"{client_id}/.default openid profile offline_access"

    payload = {
        "grant_type": "refresh_token",
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "scope": scope
    }

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }


    response = requests.post(token_url, headers=headers, data=payload)

    return response.json()["access_token"]


def search_well_log_datasets(wellbore_id: str) -> List[str]:
    """
    Search the given wellbore by id and returns the datasets.
    Args:
        wellbore_id (str): id of the wellbore

    Returns:
        List of dataset ids.
    """


    print(colored(f"Searching {wellbore_id}", "green"))

    osdu_url = os.environ.get("OSDU_URL")
    search_url = urljoin(osdu_url, "api/search/v2/query")
    
    headers = {
        "data-partition-id": "opendes",
        "Authorization": f"Bearer {get_access_token()}",
        "Content-Type": "application/json",
    }

    payload = {
        "kind": "osdu:wks:work-product-component--WellLog:1.0.0",
        "query": f"data.WellboreID:(\"{wellbore_id}\")"
    }

    response = requests.post(search_url, headers=headers, data=json.dumps(payload))
    results = response.json()["results"]
    if len(results) != 1:
        print(colored(f"Invalid well bore id: {wellbore_id}.", "red"))
        raise ValueError

    datasets = [dataset[:-1] for dataset in results[0].get("data").get("Datasets")]
    print(colored(f"{len(datasets)} datasets found in the well log.", "green"))
    return datasets


def download_dataset(dataset_id: str) -> str:
    """
    Download dataset by given id and save the content in string.
    Args:
        dataset_id (str): Id of the datasets.

    Returns:
        Content of the dataset.
    """
    print(colored(f"Downloading {dataset_id}...", "green"))
    osdu_url = os.environ.get("OSDU_URL")
    file_url = urljoin(osdu_url, f"/api/file/v2/files/{dataset_id}/downloadURL")

    headers = {
        "data-partition-id": "opendes",
        "Authorization": f"Bearer {get_access_token()}",
    }

    response = requests.get(file_url, headers=headers)
    signed_url = response.json()["SignedUrl"]

    response = requests.get(signed_url)
    return response.content.decode()


if __name__ == "__main__":
    datasets = search_well_log_datasets("opendes:master-data--Wellbore:ad215042-f7c7-2b7e-e053-c818a488c79a")

    for dataset in datasets:
        log_data = download_dataset(dataset)
