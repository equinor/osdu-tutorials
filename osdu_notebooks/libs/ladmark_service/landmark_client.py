import logging
import requests
import time
import json

from libs.osdu_service.osdu_exeptions import OsduApiExceptions

class HttpClient:
    DEFAULT_TIMEOUT = 10000

    def __init__(self):
        self._session = self._init_session()
        self.retry_attempts = 3
        self.retry_delay = 10

    @staticmethod
    def _init_session():
        session = requests.session()
        session.headers.update({"User-Agent": "osdu/seismic_metadata"})
        return session

    def close(self):
        self._session.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()

    def _request(self, method, path, **kwargs):
        kwargs = kwargs.get("params") or {}
        kwargs["timeout"] = kwargs.get("timeout", self.DEFAULT_TIMEOUT)
        response = getattr(self._session, method)(path, **kwargs)
        return self._handle_response(response)
    
    def _request_retry(self, method, path, **kwargs):
            
        for attempt in range(self.retry_attempts):
            # logging.warning("Request attempt: %s", attempt)
            try:
                kwargs = kwargs.get("params") or {}
                kwargs["timeout"] = kwargs.get("timeout", self.DEFAULT_TIMEOUT)
                response = getattr(self._session, method)(path, **kwargs)
                return self._handle_response(response)
            
            except Exception as e:
                logging.error("Request failed on attempt %s: %s", attempt, str(e))
                time.sleep(self.retry_delay)
                
        logging.error("Request retries exhausted")     
        return None

    @staticmethod
    def _handle_response(response):
        if not response.ok:
            raise OsduApiExceptions(response)

        try:
            content_type = response.headers.get("Content-Type", "")
            if "application/json" in content_type:
                return json.loads(response.content, strict=False)
            if "text/csv" in content_type:
                return response.text
            if "text/plain" in content_type:
                return response.text
            if "application/xml" in content_type:
                return response.text
            raise OsduApiExceptions("Invalid Response: {}".format(response.text))
        except ValueError:
            raise OsduApiExceptions("Invalid Response: {}".format(response.text))

    @staticmethod
    def _format_params(params):
        return {
            k: json.dumps(v) if isinstance(v, bool) else v for k, v in params.items()
        }

class LandmarkService(HttpClient):
    
    def __init__(self, base_url, token_url, refresh_token):
        super().__init__()
        self.__token = None
        self.__refresh_token = refresh_token
        self.base_url = base_url
        self.token_url = token_url
        self.token_cache = None

    @property
    def token(self):
        """method to get token, token needs to be cache for usage
        should only get a new one once the exisitng token expires"""

        return self.__token

    @token.setter
    def token(self, token):
        # {todo} use getter setter attribute
        self.__token = token

    @property
    def refresh_token(self):
        """method to get token, token needs to be cache for usage
        should only get a new one once the exisitng token expires"""
        return self.__refresh_token

    @refresh_token.setter
    def refresh_token(self, refresh_token):
        self.__refresh_token = refresh_token
    
    def access_token(self):
        
        access_token = None
        
        body = {
            "grant_type": "refresh_token",
            "refresh_token": f"{self.refresh_token}",
            "client_id": "enterprise-search"
        }
        
        params = {
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
                }, "data": body
        }
        
        res = self._request_retry(
            "post", f"{self.token_url}/protocol/openid-connect/token", params=params
        )
        
        if res is not None:
            access_token = res["access_token"]
            
        return access_token
    
    def get_access_token(self):
    
        current_time = time.time()

        if self.token_cache and "access_token" in self.token_cache and "expiration_time" in self.token_cache:
            
            access_token = self.token_cache["access_token"]
            expiration_time = self.token_cache["expiration_time"]

            if expiration_time > current_time:
                logging.warning("Getting cached token...")
                return access_token

        logging.warning("Refreshing token...")
        self.refresh_access_token()
        access_token = self.token_cache["access_token"]

        return access_token

    def refresh_access_token(self):

        body = {
            "grant_type": "refresh_token",
            "refresh_token": f"{self.refresh_token}",
            "client_id": "enterprise-search"}
        params = {"headers": {
            "Content-Type": "application/x-www-form-urlencoded"}, "data": body}

        current_time = time.time()
        
        res = self._request_retry(
            "post", f"{self.token_url}/protocol/openid-connect/token", params=params
        )

        if res is not None:
            self.token_cache = {
                "access_token": res["access_token"],
                "expiration_time": current_time + int(res.get("expires_in", 0))
            }


    @staticmethod
    def set_default_filters(lastrundatetime=None, before_rundate=None, default_filters=None):

        if default_filters is None:
            default_filters = dict()

        if lastrundatetime is not None:
            if before_rundate:
                default_filters['createDate'] = ["le", f"datetime'{lastrundatetime}'", "eq", "null"]
            else:
                default_filters['updateDate'] = ["ge", f"datetime'{lastrundatetime}'"]

        return default_filters

    def join_filters(self, filters_dictionary: dict):
        i_filter =  []
        for key, value in filters_dictionary.items():
            if len(value) == 2:
                i_filter.append(" ".join([key, value[0], value[1]]))
            elif len(value) > 2 and len(value)%2 ==0:
                # i_filter.append(" ".join([key, value[0], value[1], "or", key, value[2], value[3]]))
                i_filter.append(" ".join(["(", key, value[0], value[1], "or", key, value[2], value[3], ")"]))

        return ' and '.join(i_filter)


    def get_query_params(self, **kwargs):

        query_params = dict()

        if kwargs.get("relativePath"):
            query_params["relativePath"] = kwargs["relativePath"]

        if kwargs.get("filters_dict") is None or kwargs.get("filters_dict") is not None:
            filters_set = self.set_default_filters(kwargs.get("lastrundatetime"), kwargs.get("before_rundate"), kwargs.get("filters_dict"))
            query_params["$filter"] = self.join_filters(filters_set)

        if kwargs.get("expand_on"):
            query_params["$expand"] = kwargs["expand_on"]
            
        if kwargs.get("return_cols"):
            query_params["$select"] = ','.join(kwargs["return_cols"])

        return query_params

    def get_relative_path(self, counts = False, **kwargs):

        query_params = self.get_query_params(**kwargs)

        if counts:
            relative_path = f"{query_params.get('relativePath')}/$count?"
            for key in ['$filter']:
                if query_params.get(key):
                        relative_path = f"{relative_path}&{key}={query_params[key]}"     
            return relative_path
            
        relative_path = f"{query_params.get('relativePath')}?$format=json"
        for key in ['$filter', '$expand', '$select']:
            if query_params.get(key):
                relative_path = f"{relative_path}&{key}={query_params[key]}"

        return f"{relative_path}&$inlinecount=allpages"
    
    def get_count(self, **kwargs):
        
        path = self.get_relative_path(counts=True, **kwargs)
        
        params = {
                "headers": {
                    "Authorization": f"Bearer {self.access_token()}",
                    "Accept": "*/*"
                }
            }
        
        res = self._request("get", f"{self.base_url}/{path}", params=params)
        
        return res
        
    def get_records(self, relative_path:str, **kwargs):
        
        """Uses server-side pagination to request the records using the odata.nextlink, 
        feature only available when using server-sice pagination.
        The records are appended to an array and return once all records have been requested.

        Yields:
            records: Array of records recieved in the response.
        """
        
        path = self.get_relative_path(**kwargs)
        logging.warning("Sending request to: %s", f"{self.base_url}/{path}")

        records = []
        while path:
            params = {
                "headers": {
                    "Authorization": f"Bearer {self.access_token()}",
                    "Accept": "*/*"
                }
            }

            res = self._request("get", f"{self.base_url}/{path}", params=params)
            records.extend(res.get('value'))
            path = res.get('odata.nextLink', None)

        return records
    
    def get_records_by_batch_server_pagination(self, **kwargs):
            
        """Uses server-side pagination to request the records using the odata.nextlink, 
        feature only available when using server-sice pagination.

        Yields:
            records: Array of records recieved in the response.
        """
        
        path = self.get_relative_path(counts = False, **kwargs)
        logging.warning("Sending request to: %s", f"{self.base_url}/{path}")

        while path:
            
            params = {
                "headers": {
                    "Authorization": f"Bearer {self.access_token()}",
                    "Accept": "*/*"
                }
            }
            # print(f"{self.base_url}/{path}")
            res = self._request_retry("get", f"{self.base_url}/{path}", params=params)
            records = res.get('value')
            path = res.get('odata.nextLink', None)
            
            yield records  
    
    def get_records_by_batch_client_pagination(self, **kwargs):
        
        """Uses client-side pagination to request the records using top and skip parameters, 
        feature only available when using client-sice pagination. Note that when using clien-side
        pagination the odata.nextlink feature is not available.
        
        For entities data of which is too big that using server-side pagination leads to API breakout,
        client-side pagination is recommended. However the time of each request will increase.

        Yields:
            records: Array of records recieved in the response.
        """
    
        max_batch_size = 1000
        if kwargs.get("mini_batch_size") <= max_batch_size:
            batch_size = kwargs.get("mini_batch_size")
        else:
            batch_size = max_batch_size

        path = self.get_relative_path(counts = False, **kwargs)
        logging.warning("Sending request to: %s", f"{self.base_url}/{path}")
        
        max_offset = int(self.get_count(**kwargs))
        offset = 0
        
        batch_i = 0
        while offset < (max_offset + batch_size) and path:
            
            logging.warning("%s --- Retrieving new token for batch: %s", kwargs.get("relativePath"), batch_i)
            
            # access_token = self.get_access_token()
            access_token = self.access_token()
            
            params = {
                "headers": {
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "*/*"
                }
            }

            logging.warning("%s --- Requesting batch from Diskos: %s", kwargs.get("relativePath"), batch_i)
            
            curr_path = f"{path}&$top={batch_size}&$skip={offset}"
            res = self._request_retry("get", f"{self.base_url}/{curr_path}", params=params)

            if res is not None:
                logging.warning("%s --- Offset that succeded: %s", kwargs.get("relativePath"), offset)
                
                batch = res.get('value')
                offset += batch_size
                batch_i += 1
                
                if len(batch) == 0:
                    path = None
                       
                yield batch
            
            else:
                logging.warning("%s --- Offset that failed: %s", kwargs.get("relativePath"), offset)
                
                batch_i += 1
                offset += batch_size
                continue
            
    def get_records_by_batch(self, path: str = None, **kwargs):
        """Uses server-side pagination to request the records using
        the odata.nextlink, feature only available when using server-sice
        pagination. The records are appended to an array and return once
        all records have been requested.

        Returns:
            records(list): List of all records recieved in the API response.
        """
        if not path:
            path = self.get_relative_path(**kwargs)
            print(path)

        records = []
        while path:

            res = self._request_retry("get", f"{self.base_url}/{path}")
            records.extend(res.get('value'))
            path = res.get('odata.nextLink', None)

        return records

    def request_record_ids(self, **kwargs):
        """Request the ids of the records from the specified endpoint.
        This is used for later looping through the ids and request the
        complete records.

        Remark: This is ONLY a work-around connected to the
        get_records_by_mini_batch method in order to avoid a 502-Bad Gateway
        response when requesting the records by using server pagination method
        (get_records_by_server_pagination) or when the client-side pagination
        method (get_records_by_batch_client_pagination) is not optimal due to
        the large number of records to be walked througth by the client-side
        pagination logic.

        Returns:
            unique_ids(list), int: List of unique record ids, Number of unique
            record ids.
        """

        logging.info("Requesting record ids from the source.")

        _kwargs_ids = {
            "relativePath": kwargs.get('relativePath'),
            "filters_dict": kwargs.get('filters_dict'),
            "return_cols": [kwargs.get('id_key')]
        }

        records = self.get_records_by_batch(**_kwargs_ids)
        unique_ids = list(
            set([record.get(kwargs.get("id_key")) for record in records]))

        logging.warning("Requesting ids from the source: Finished. %s total unique ids retrieved",
                        len(records))

        return unique_ids, len(records)
            
    def get_records_by_mini_batch(self, **kwargs):
        """Request first all the unique ids from the specified API enpoint
        and then loops thourgh them using a batch size window to request
        the complete records.

        Remark: This is ONLY a work-around in order to avoid a 502-Bad Gateway
        response when requesting the records by using server pagination method
        (get_records_by_server_pagination) or when the client-side pagination
        method (get_records_by_batch_client_pagination) is not optimal due to
        the large number of records to be walked througth by the client-side
        pagination logic.

        Yields:
            list: Requested records. 
        """

        unique_ids, total_records = self.request_record_ids(**kwargs)

        max_batch_size = 100
        if kwargs.get("mini_batch_size") <= max_batch_size:
            mini_batch_size = kwargs.get("mini_batch_size")
        else:
            mini_batch_size = max_batch_size
            logging.warning(
                "Mini batch size exceeds the maximum number possible from source")

        actual_response_size = 0
        batch_records = 0
        batch_i = 0

        while batch_records < len(unique_ids):

            ids_batch = unique_ids[mini_batch_size *
                                   batch_i:mini_batch_size * (batch_i + 1)]

            new_kwargs = kwargs.copy()
            new_kwargs["filters_dict"] = {
                f"{kwargs.get('id_key')}":
                    {
                        'operators': ["eq"]*len(ids_batch),
                        'values': [f"'{id}'" for id in ids_batch],
                        'concatenate_to_path_with': 'and'
                    }
            }

            res = self.get_records_by_batch(**new_kwargs)
            batch_records += len(ids_batch)
            actual_response_size += len(res)
            batch_i += 1

            logging.warning(
                "Requesting unique id batch of lenght: %s/%s - cummulative records response: %s/%s",
                str(batch_records), str(len(unique_ids)), str(actual_response_size), str(total_records)
            )

            if res is not None:
                yield res
