"""Useful functions."""

import logging
import os
import sys
from configparser import ConfigParser, RawConfigParser
from datetime import datetime
from json import loads
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

logger = logging.getLogger("Token manager")


class ClassProperty:
    """
    Decorator that allows get methods like class properties.
    """

    def __init__(self, fget):
        self.fget = fget

    def __get__(self, owner_self, owner_cls):
        return self.fget(owner_cls)


classproperty = ClassProperty


class TokenManager:
    """
    Class for token managing.

    Simple usage:
    print(TokenManager.id_token)
    print(TokenManager.access_token)

    Requires dataload.ini with:
    [CONNECTION]
    token_endpoint = <token_endpoint_url>
    retries = <retries_count>

    Requires "REFRESH_TOKEN", "CLIENT_ID", "CLIENT_SECRET" in environment variables
    """
    _config = ConfigParser()
    _config.read("config/dataload.ini")
    expire_date = 0

    try:
        _retries = _config.getint("CONNECTION", "retries")
        _token_endpoint = _config["CONNECTION"]["token_endpoint"]
    except KeyError as e:
        logger.error(f"'{e.args[0]}' should be in dataload.ini")
        sys.exit(0)

    try:
        _refresh_token = os.environ["REFRESH_TOKEN"]
        _client_id = os.environ["CLIENT_ID"]
        _client_secret = os.environ["CLIENT_SECRET"]
    except KeyError as e:
        logger.error(f"Environment should have variable '{e.args[0]}'")
        sys.exit(0)

    @classproperty
    def id_token(cls):
        """
        Check expiration date and return id_token.
        """
        if datetime.now().timestamp() > cls.expire_date:
            cls.refresh()
        return cls._id_token

    @classproperty
    def access_token(cls):
        """
        Check expiration date and return access_token.
        """
        if datetime.now().timestamp() > cls.expire_date:
            cls.refresh()
        return cls._access_token

    @classmethod
    def refresh(cls):
        """
        Refresh token and save them into class.
        """
        logger.info(f"Refreshing token.")

        for i in range(cls._retries):
            # try several times if there any error
            try:
                resp = cls.refresh_request(
                    cls._token_endpoint, cls._refresh_token, cls._client_id, cls._client_secret)
            except HTTPError:
                if i == cls._retries - 1:
                    # too many errors, raise original exception
                    raise
        cls._id_token = resp["id_token"]
        cls._access_token = resp["access_token"]
        cls.expire_date = datetime.now().timestamp() + resp["expires_in"]

        logger.info(f"Token is refreshed.")

    @staticmethod
    def refresh_request(url: str, refresh_token: str, client_id: str, client_secret: str) -> dict:
        """
        Send refresh token requests to OpenID token endpoint.

        Return dict with keys "access_token", "expires_in", "scope", "token_type", "id_token".
        """

        body = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": client_id,
            "client_secret": client_secret,
        }
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = urlencode(body).encode("utf8")
        request = Request(url=url, data=data, headers=headers)
        try:
            response = urlopen(request)
            response_body = response.read()
            return loads(response_body)
        except HTTPError as e:
            code = e.code
            message = e.read().decode("utf8")
            logger.error(f"Refresh token request failed. {code} {message}")
            raise


def get_token(config: RawConfigParser) -> str:
    """
    Refresh access or id token depending on config settings.

    :param RawConfigParser config: config that is used in calling module
    :return: token of requested type
    :rtype: str
    """
    token_type = config.get("CONNECTION", "token_type")

    tokens_dict = {
        "access_token": TokenManager.access_token,
        "id_token": TokenManager.id_token
    }

    if token_type not in tokens_dict.keys():
        logger.error(f"Unknown type of token {token_type}. Set correct token type in config file.")
        sys.exit(2)

    return tokens_dict.get(token_type)


def get_headers(config: RawConfigParser) -> dict:
    """
    Get request headers.

    :param RawConfigParser config: config that is used in calling module
    :return: dictionary with headers required for requests
    :rtype: dict
    """
    return {
        "Content-Type": "application/json",
        "data-partition-id": config.get("CONNECTION", "data-partition-id"),
        "Authorization": f"Bearer {get_token(config)}"
    }
