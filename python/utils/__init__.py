"""Module provides convenience wrappers for OSDU Search API calls."""
import logging
import requests

from typing import Any, Dict
from werkzeug.exceptions import HTTPException, BadRequest
from flask import request, session

from app_config import OSDU_API_SEARCH_URL

logger = logging.getLogger(__name__)

DEFAULT_QUERY_LIMIT = 99    # Limit the number of results to 99 if not explicitly set


def call_search_api(request: request, search_query: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare and make a request to OSDU search API.

    This function gets search query as a parameter, extracts session object
    from the request context and pulls auth tokens from the session. It then
    creates the required headers and makes a Search API call. Finally, it
    verifies the response status and passes the json results back to the caller.
    """
    logger.error(request)
    # session object was added to the context by the authorization middleware
    # it contains both access_token and id_token required for the OSDU calls
    logger.debug(
        f"Extracting authorization tokens from the session object: {session}")

    # create authorization headers
    headers = session.create_authorization_headers()
    if headers is None:
        raise HTTPException(
            BadRequest,
            "Cannot make API call",
            "Unknown target platform, check OSDU_TARGET_PLATFORM setting."
        )

    # set the default pagination limit if not set explicitly in the query
    if "limit" not in search_query:
        search_query["limit"] = DEFAULT_QUERY_LIMIT

    # make request to OSDU Search API
    logger.debug(f"Starting API call to {OSDU_API_SEARCH_URL}")
    search_response = requests.post(
        OSDU_API_SEARCH_URL,
        headers=headers,
        json=search_query)
    logger.debug(f"Response details: {search_response.json()}")

    # verify status code
    if search_response.status_code != requests.codes.OK:
        logger.error(
            f"Request failed with the status code={search_response.status_code} \
            and message={search_response.text}")
        raise HTTPException(
            "{}".format(search_response.status_code),
            "Search API call failed",
            "OSDU Search API call has failed (HTTP {}): {}"
            .format(search_response.status_code, search_response.text))

    return search_response.json()