class OsduExceptions(Exception):
    """code exceptions"""

    def __init__(self, message):
        super(OsduExceptions, self).__init__()
        self.message = message

    def __str__(self):
        return "OsduExceptions: {}".format(self.message)

class OsduApiExceptions(Exception):
    """class for api related exceptions"""

    def __init__(self, response):
        super(OsduApiExceptions, self).__init__()

        self.code = 0

        try:
            json_response = response.json()
        except ValueError:
            self.message = "JSON error message from API: {}".format(response.text)
        else:
            if "error" not in json_response:
                self.message = "Wrong json format from API"
            else:
                self.message = json_response["error"]
                # self.error_description = json_response["error_description"]

        self.status_code = response.status_code
        self.response = response

    def __str__(self):
        return "OsduApiExceptions(status_code: {}): {}".format(
            self.status_code, self.message
        )
